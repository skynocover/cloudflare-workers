'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TitleInputDialogProps {
  isOpen: boolean;
  onClose: (title: string | null) => void;
}

export function TitleInputDialog({ isOpen, onClose }: TitleInputDialogProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose(title);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>輸入圖片標題</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="輸入標題"
            className="mb-4"
          />
          <DialogFooter>
            <Button type="submit" disabled={!title}>
              確認
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
