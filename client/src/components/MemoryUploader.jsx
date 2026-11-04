import React, { useState, useRef } from 'react';
import { UploadCloud, Image, Video, Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';
import { useMemories } from '../hooks/useMemories';

export const MemoryUploader = ({ isOpen, onClose }) => {
  const { uploadMemory, isUploading } = useMemories();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [isVisibleOnDashboard, setIsVisibleOnDashboard] = useState(false); // Private by default!
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isImg = selected.mimetype ? selected.mimetype.startsWith('image/') : selected.type.startsWith('image/');
    const isVid = selected.mimetype ? selected.mimetype.startsWith('video/') : selected.type.startsWith('video/');

    if (!isImg && !isVid) {
      setErrorMsg('Please select a valid image or video file.');
      return;
    }

    setFile(selected);
    setMediaType(isVid ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(selected));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please choose a photo or video to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('caption', caption);
      formData.append('isVisibleOnDashboard', isVisibleOnDashboard.toString());

      await uploadMemory(formData);
      handleClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to upload memory.');
    }
  };

  const handleClose = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setCaption('');
    setIsVisibleOnDashboard(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto glass-modal rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h3 className="text-xl font-serif font-bold text-slate-800">
            Add a New Memory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Store photos &amp; videos safely in your private vault or share to the feed.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* File Picker / Preview Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative cursor-pointer border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-rose-50/40 hover:bg-rose-50/70 transition-all min-h-[170px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video src={previewUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                  Change media
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Click or drag photo / video here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Direct Cloudinary media upload (Max 50MB)
                </p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Romantic Caption or Story
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Where was this? What did it feel like in that moment?..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:border-rose-400 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Crucial requirement: Dashboard Visibility Toggle (Default: False) */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isVisibleOnDashboard ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {isVisibleOnDashboard ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Show on Home Dashboard
                </p>
                <p className="text-[11px] text-slate-500">
                  {isVisibleOnDashboard
                    ? 'Visible on shared home feed for both'
                    : 'Private by default: stored in private vault only'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isVisibleOnDashboard}
                onChange={(e) => setIsVisibleOnDashboard(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-rose-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to Vault...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Memory</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
