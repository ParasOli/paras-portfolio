"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaCheck, FaTimes, FaSearchPlus, FaSearchMinus } from "react-icons/fa";

interface CropModalProps {
  imageSrc: string;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
  aspect?: number; // e.g. 1 for square, 16/9 for widescreen
  cropShape?: "round" | "rect";
}

export default function CropModal({
  imageSrc,
  onCrop,
  onCancel,
  aspect = 1,
  cropShape = "rect",
}: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(0.1);
  const [maxScale, setMaxScale] = useState(5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const CROP_SIZE = 320;
  const CANVAS_SIZE = 440;
  const cropX = (CANVAS_SIZE - CROP_SIZE) / 2;
  const cropY = (CANVAS_SIZE - (CROP_SIZE / aspect)) / 2;
  const cropW = CROP_SIZE;
  const cropH = CROP_SIZE / aspect;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Dark overlay background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const imgX = CANVAS_SIZE / 2 - drawW / 2 + offset.x;
    const imgY = CANVAS_SIZE / 2 - drawH / 2 + offset.y;
    ctx.drawImage(img, imgX, imgY, drawW, drawH);

    // Dark overlay outside crop
    ctx.fillStyle = "rgba(2, 6, 23, 0.75)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Clip to crop area and redraw image (to show it bright in crop zone)
    ctx.save();
    if (cropShape === "round") {
      ctx.beginPath();
      ctx.ellipse(cropX + cropW / 2, cropY + cropH / 2, cropW / 2, cropH / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.roundRect(cropX, cropY, cropW, cropH, 12);
      ctx.clip();
    }
    ctx.drawImage(img, imgX, imgY, drawW, drawH);
    ctx.restore();

    // Crop border
    ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
    ctx.lineWidth = 2;
    if (cropShape === "round") {
      ctx.beginPath();
      ctx.ellipse(cropX + cropW / 2, cropY + cropH / 2, cropW / 2, cropH / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(cropX, cropY, cropW, cropH, 12);
      ctx.stroke();
    }

    // Grid lines inside crop
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    if (cropShape === "round") {
      ctx.beginPath();
      ctx.ellipse(cropX + cropW / 2, cropY + cropH / 2, cropW / 2, cropH / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.roundRect(cropX, cropY, cropW, cropH, 12);
      ctx.clip();
    }
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(cropX + (cropW / 3) * i, cropY); ctx.lineTo(cropX + (cropW / 3) * i, cropY + cropH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cropX, cropY + (cropH / 3) * i); ctx.lineTo(cropX + cropW, cropY + (cropH / 3) * i); ctx.stroke();
    }
    ctx.restore();
  }, [scale, offset, imgLoaded, cropShape, cropX, cropY, cropW, cropH]);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      // Auto-fit
      const fitScale = Math.max(cropW / img.naturalWidth, cropH / img.naturalHeight);
      
      const calculatedMin = Math.min(fitScale * 0.2, 0.05);
      const calculatedMax = Math.max(fitScale * 10, 5);
      setMinScale(calculatedMin);
      setMaxScale(calculatedMax);
      
      setScale(fitScale);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const screenDrawW = img.naturalWidth * scale;
    const screenDrawH = img.naturalHeight * scale;
    const screenImgX = CANVAS_SIZE / 2 - screenDrawW / 2 + offset.x;
    const screenImgY = CANVAS_SIZE / 2 - screenDrawH / 2 + offset.y;

    // Use a scaling factor to guarantee high quality output.
    // Factor of 1/scale renders the image at its natural resolution.
    let factor = 1 / scale;
    
    // Cap output to 2048px maximum width/height to avoid massive files.
    const maxCanvasSize = 2048;
    if (cropW * factor > maxCanvasSize) {
      factor = maxCanvasSize / cropW;
    }
    if (cropH * factor > maxCanvasSize) {
      factor = Math.min(factor, maxCanvasSize / cropH);
    }

    const out = document.createElement("canvas");
    out.width = cropW * factor;
    out.height = cropH * factor;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    // By multiplying all parameters by factor, we effectively use the exact same reliable 
    // clipping logic as the visual screen, but rendered at a much higher resolution.
    // This perfectly avoids Safari/iOS bugs with 9-argument drawImage and negative source boundaries.
    const drawW = screenDrawW * factor;
    const drawH = screenDrawH * factor;
    const dx = (screenImgX - cropX) * factor;
    const dy = (screenImgY - cropY) * factor;

    ctx.drawImage(img, dx, dy, drawW, drawH);

    out.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, "image/webp", 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-5 shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-white font-bold text-sm">Crop Image</h3>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors"><FaTimes /></button>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-2xl cursor-grab active:cursor-grabbing touch-none"
          style={{ width: "100%", maxWidth: CANVAS_SIZE }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
        />

        <p className="text-[10px] text-slate-600 uppercase tracking-widest">Drag to reposition</p>

        {/* Zoom Slider */}
        <div className="flex items-center gap-3 w-full">
          <button onClick={() => setScale(s => Math.max(minScale, s - (maxScale - minScale) * 0.05))} className="text-slate-400 hover:text-white"><FaSearchMinus size={14} /></button>
          <input
            type="range" min={minScale} max={maxScale} step={(maxScale - minScale) / 100}
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-sky-500"
          />
          <button onClick={() => setScale(s => Math.min(maxScale, s + (maxScale - minScale) * 0.05))} className="text-slate-400 hover:text-white"><FaSearchPlus size={14} /></button>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-all">Cancel</button>
          <button onClick={handleConfirm} className="flex-1 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-400 transition-all flex items-center justify-center gap-2">
            <FaCheck size={12} /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
