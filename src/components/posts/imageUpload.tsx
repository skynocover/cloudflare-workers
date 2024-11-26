'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TitleInputDialog } from '@/components/posts/titleInput';
import { getImages, uploadImage, deleteImage } from '@/app/actions/images';

interface ImageInfo {
  id: string;
  title: string;
  url: string;
  aiAnalysis: string;
  violatesRules: boolean;
}

export default function ImageUploadGallery() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const fetchImages = async () => {
    const images = await getImages();
    setImages(
      images.map((img) => ({
        ...img,
        id: img.id.toString(),
        violatesRules: !!img.violatesRules,
      })),
    );
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setCurrentFile(acceptedFiles[0]);
    setDialogOpen(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleInputChange = (id: string, field: keyof ImageInfo, value: string | boolean) => {
    setImages((prevImages) =>
      prevImages.map((img) => (img.id === id ? { ...img, [field]: value } : img)),
    );
  };

  const handleDialogClose = async (title: string | null) => {
    setDialogOpen(false);
    if (title && currentFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;

        // 上傳圖片
        await uploadImage({
          title,
          base64Image,
          contentType: currentFile.type,
          violatesRules: false,
        });

        fetchImages();
      };
      reader.readAsDataURL(currentFile);
    }
    setCurrentFile(null);
  };

  // Simulating AI analysis (replace with actual API call in production)
  const simulateAIAnalysis = (id: string) => {
    setTimeout(() => {
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === id
            ? {
                ...img,
                aiAnalysis: '這是一張' + (Math.random() > 0.5 ? '安全' : '不安全') + '的圖片。',
                violatesRules: Math.random() > 0.7,
              }
            : img,
        ),
      );
    }, 1500);
  };

  const handleDelete = async (imageUrl: string) => {
    const result = await deleteImage(imageUrl);
    if (result.success) {
      // 重新獲取圖片列表以更新UI
      fetchImages();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>拖放文件到這裡 ...</p> : <p>拖放文件到這裡，或點擊選擇文件</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>
                <Input
                  type="text"
                  placeholder="標題"
                  value={image.title}
                  onChange={(e) => handleInputChange(image.id, 'title', e.target.value)}
                  className="w-full"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video relative">
                <Image
                  src={image.url}
                  alt={image.title || '上傳的圖片'}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <p className="text-sm">圖片URL: {image.url}</p>
              <p className="text-sm">AI分析: {image.aiAnalysis}</p>
              <p className="text-sm">是否違反規則: {image.violatesRules ? '是' : '否'}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => simulateAIAnalysis(image.id)}>進行AI分析</Button>
              <Button variant="destructive" onClick={() => handleDelete(image.url)}>
                刪除
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <TitleInputDialog isOpen={dialogOpen} onClose={handleDialogClose} />
    </div>
  );
}
