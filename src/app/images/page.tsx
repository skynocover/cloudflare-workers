import ImageUploadGallery from '@/components/posts/imageUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">圖片上傳與分析</h1>
        <ImageUploadGallery />
      </div>
    </main>
  );
}
