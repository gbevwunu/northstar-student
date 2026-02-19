'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { documentApi } from '@/lib/api';

const DOC_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  STUDY_PERMIT: { label: 'Study Permit', icon: '🪪', color: 'text-blue-400' },
  ENROLLMENT_LETTER: { label: 'Enrollment Letter', icon: '🎓', color: 'text-green-400' },
  WORK_PERMIT: { label: 'Work Permit', icon: '💼', color: 'text-purple-400' },
  COOOP_LETTER: { label: 'Co-op Letter', icon: '📝', color: 'text-indigo-400' },
  LEASE_AGREEMENT: { label: 'Lease Agreement', icon: '🏠', color: 'text-orange-400' },
  HEALTH_INSURANCE: { label: 'Health Insurance', icon: '❤️', color: 'text-red-400' },
  TAX_RETURN: { label: 'Tax Return', icon: '🧾', color: 'text-gray-400' },
  OTHER: { label: 'Other', icon: '📄', color: 'text-slate-400' },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const router = useRouter();
  const { token, loadFromStorage } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('OTHER');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Drag & drop
  const [isDragging, setIsDragging] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  async function fetchDocuments() {
    try {
      const res: any = await documentApi.getAll(token!);
      setDocuments(res.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(file: File) {
    setUploadError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only PDF, JPEG, PNG, WebP, and Word documents are supported.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File must be under 10 MB.');
      return;
    }

    setSelectedFile(file);
    setShowUpload(true);
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  async function handleUpload() {
    if (!selectedFile || !token) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Step 1: Get presigned URL
      setUploadProgress(20);
      const res: any = await documentApi.getUploadUrl(token, {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        type: docType,
      });

      // Step 2: Upload directly to S3
      setUploadProgress(50);
      await fetch(res.uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      });

      setUploadProgress(100);

      // Refresh and close
      await fetchDocuments();
      setShowUpload(false);
      setSelectedFile(null);
      setDocType('OTHER');
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(docId: string) {
    try {
      const res: any = await documentApi.getDownloadUrl(token!, docId);
      window.open(res.downloadUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    }
  }

  async function handleDelete() {
    if (!deleteId || !token) return;
    setDeleting(true);
    try {
      await documentApi.delete(token, deleteId);
      await fetchDocuments();
      setDeleteId(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  }

  const categories = Array.from(new Set(documents.map((d) => d.type)));
  const filteredDocs = filter === 'ALL'
    ? documents
    : documents.filter((d) => d.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-slate-400 hover:text-white transition">← Dashboard</a>
          <span className="text-sm text-slate-500">Documents</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">📁 Documents</h1>
          <button
            onClick={() => {
              setShowUpload(true);
              setSelectedFile(null);
              setUploadError(null);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <span>+</span> Upload Document
          </button>
        </div>
        <p className="text-slate-400 mb-8">
          Securely store your study permit, enrollment letters, and other important documents.
        </p>

        {/* Upload Zone - Drag & Drop */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={onFileInputChange}
          />
          <span className="text-4xl block mb-3">{isDragging ? '📥' : '☁️'}</span>
          <p className="text-slate-300 font-medium">
            {isDragging ? 'Drop your file here' : 'Drag & drop a file here, or click to browse'}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            PDF, JPEG, PNG, WebP, or Word documents • Max 10 MB
          </p>
        </div>

        {/* Category Filters */}
        {documents.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <FilterBtn active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="All" />
            {categories.map((cat) => {
              const cfg = DOC_TYPES[cat] || DOC_TYPES.OTHER;
              return (
                <FilterBtn
                  key={cat}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                  label={`${cfg.icon} ${cfg.label}`}
                />
              );
            })}
          </div>
        )}

        {/* Document List */}
        {documents.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <span className="text-5xl block mb-4">📁</span>
            <h2 className="text-xl font-semibold mb-2">No documents uploaded</h2>
            <p className="text-slate-400 mb-6">
              Upload your study permit, enrollment letter, and other documents to keep them organized and accessible.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition"
            >
              Upload Your First Document →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const cfg = DOC_TYPES[doc.type] || DOC_TYPES.OTHER;
              return (
                <div
                  key={doc.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4 group hover:border-slate-600 transition"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {cfg.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium truncate">{doc.fileName}</h3>
                      {doc.isVerified && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className={cfg.color}>{cfg.label}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      {doc.expiresAt && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-400">
                            Expires {new Date(doc.expiresAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                      title="Download"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => setDeleteId(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {documents.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="Total" value={documents.length} icon="📁" />
            <StatBox label="Verified" value={documents.filter((d) => d.isVerified).length} icon="✅" />
            <StatBox
              label="Total Size"
              value={formatFileSize(documents.reduce((sum: number, d: any) => sum + d.fileSize, 0))}
              icon="💾"
              isText
            />
            <StatBox label="Categories" value={categories.length} icon="🏷️" />
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">📤 Upload Document</h2>

            {/* File Info or File Picker */}
            {selectedFile ? (
              <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition mb-4"
              >
                <span className="text-3xl block mb-2">📎</span>
                <p className="text-sm text-slate-400">Click to select a file</p>
              </div>
            )}

            {/* Document Type Selector */}
            <label className="block text-sm text-slate-400 mb-1.5">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white mb-4 focus:outline-none focus:border-blue-500"
            >
              {Object.entries(DOC_TYPES).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.icon} {cfg.label}
                </option>
              ))}
            </select>

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400">{uploadError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setUploadError(null);
                }}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-6 text-center">
            <span className="text-4xl block mb-3">⚠️</span>
            <h2 className="text-lg font-bold mb-2">Delete Document?</h2>
            <p className="text-sm text-slate-400 mb-6">
              This action cannot be undone. The document will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
        active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

function StatBox({
  label,
  value,
  icon,
  isText,
}: {
  label: string;
  value: number | string;
  icon: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
      <span className="text-lg block mb-1">{icon}</span>
      <p className={`font-bold ${isText ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
