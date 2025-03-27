import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { fileService } from '../../services';
import Button from './Button';

interface IFileUploaderProps {
  projectId: string;
  periodId?: string;
  category?: string;
  onUploadComplete?: (fileIds: string[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string;
  className?: string;
}

interface IFileUploadStatus {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  fileId?: string;
}

const FileUploader: React.FC<IFileUploaderProps> = ({
  projectId,
  periodId,
  category = 'document',
  onUploadComplete,
  maxFiles = 10,
  acceptedFileTypes = ".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.kml,.csv,.geojson",
  className = '',
}) => {
  const [files, setFiles] = useState<IFileUploadStatus[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Manejar selección de archivos mediante input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Procesar archivos seleccionados
  const handleFiles = (fileList: FileList) => {
    setError(null);

    // Verificar si se excede el número máximo de archivos
    if (files.length + fileList.length > maxFiles) {
      setError(`No puedes subir más de ${maxFiles} archivos.`);
      return;
    }

    // Convertir FileList a array y procesar cada archivo
    const newFiles = Array.from(fileList).map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      name: file.name,
      progress: 0,
      status: 'pending' as const,
      file
    }));

    // Actualizar estado con los nuevos archivos
    setFiles(prev => [...prev, ...newFiles.map(({ file, ...rest }) => rest)]);

    // Iniciar la carga de cada archivo
    newFiles.forEach(fileStatus => {
      uploadFile(fileStatus.id, fileStatus.file);
    });
  };

  // Función para subir un archivo al servidor
  const uploadFile = async (fileId: string, file: File) => {
    // Actualizar estado a 'uploading'
    setFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, status: 'uploading' as const } : f)
    );

    try {
      // Llamar al servicio de carga de archivos con progreso
      const uploadedFile = await fileService.uploadFile(
        file,
        projectId,
        periodId,
        category,
        (percentage) => {
          // Actualizar progreso
          setFiles(prev =>
            prev.map(f => f.id === fileId ? { ...f, progress: percentage } : f)
          );
        }
      );

      // Actualizar estado a 'success'
      setFiles(prev =>
        prev.map(f => f.id === fileId ? {
          ...f,
          status: 'success' as const,
          progress: 100,
          fileId: uploadedFile.id.toString()
        } : f)
      );

      // Verificar si todos los archivos han terminado de procesarse
      setTimeout(() => {
        const allCompleted = files.every(f =>
          f.status === 'success' || f.status === 'error'
        );

        if (allCompleted && onUploadComplete) {
          const uploadedFileIds = files
            .filter(f => f.status === 'success')
            .map(f => f.fileId)
            .filter(Boolean) as string[];

          onUploadComplete(uploadedFileIds);
        }
      }, 100);

    } catch (err) {
      console.error("Error uploading file:", err);

      // Actualizar estado a 'error'
      setFiles(prev =>
        prev.map(f => f.id === fileId ? {
          ...f,
          status: 'error' as const,
          error: 'Error al subir el archivo.'
        } : f)
      );
    }
  };

  // Eliminar un archivo de la lista
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Abrir el selector de archivos al hacer clic en el botón
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Renderizar el estado del archivo
  const renderFileStatus = (file: IFileUploadStatus) => {
    switch (file.status) {
      case 'pending':
        return (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
        );
      case 'uploading':
        return (
          <div className="relative">
            <svg className="w-6 h-6" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e0e0e0" strokeWidth="2"></circle>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="100"
                strokeDashoffset={100 - file.progress}
                transform="rotate(-90 18 18)"
              ></circle>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              {file.progress}%
            </span>
          </div>
        );
      case 'success':
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle size={16} className="text-white" />
          </div>
        );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Área de carga */}
      <div
        className={`border-2 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'
        } rounded-lg p-6 mb-4 transition-colors duration-300 ease-in-out`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Arrastra y suelta archivos aquí, o
          </p>
          <div className="mt-2">
            <Button
              variant="primary"
              type="button"
              onClick={openFilePicker}
            >
              Seleccionar archivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFileTypes}
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {`Puedes subir hasta ${maxFiles} archivos.`}
          </p>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {files.map((file) => (
              <li
                key={file.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {renderFileStatus(file)}
                  <span className="text-sm text-gray-800">{file.name}</span>
                  {file.error && (
                    <span className="text-xs text-red-600 ml-2">{file.error}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
