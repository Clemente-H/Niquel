import React, { useState } from 'react';
import { IGeoPoint, IGeoPointCreate, IGeoPointUpdate } from '../../types/geoPoint.types';
import Button from '../common/Button';
import { Save, X, Upload } from 'lucide-react';
import { geoPointService } from '../../services';

interface GeoPointEditorProps {
  periodId: string;
  geoPoint?: IGeoPoint;  // Si se proporciona, estamos editando; si no, estamos creando
  onClose: () => void;
  onSave: (geoPoint: IGeoPoint) => void;
  className?: string;
}

const GeoPointEditor: React.FC<GeoPointEditorProps> = ({
  periodId,
  geoPoint,
  onClose,
  onSave,
  className = ''
}) => {
  const isEditing = !!geoPoint;

  const [formData, setFormData] = useState<IGeoPointCreate | IGeoPointUpdate>(
    isEditing
      ? {
          latitude: geoPoint.latitude,
          longitude: geoPoint.longitude,
          gravityLevel: geoPoint.gravityLevel || 1,
          description: geoPoint.description || '',
          kilometer: geoPoint.kilometer || 0,
          section: geoPoint.section || '',
          periodId: geoPoint.periodId
        }
      : {
          latitude: 0,
          longitude: 0,
          gravityLevel: 1,
          description: '',
          kilometer: 0,
          section: '',
          periodId
        }
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Convertir valores numéricos según sea necesario
    let processedValue: string | number = value;
    if (name === 'latitude' || name === 'longitude' || name === 'kilometer') {
      processedValue = parseFloat(value) || 0;
    } else if (name === 'gravityLevel') {
      processedValue = parseInt(value) || 1;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let savedGeoPoint: IGeoPoint;

      if (isEditing && geoPoint) {
        // Actualizar punto existente
        savedGeoPoint = await geoPointService.updateGeoPoint(
          geoPoint.id,
          formData as IGeoPointUpdate
        );
      } else {
        // Crear nuevo punto
        savedGeoPoint = await geoPointService.createGeoPoint(
          formData as IGeoPointCreate
        );
      }

      // Subir imágenes si hay alguna seleccionada
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await geoPointService.uploadGeoPointImage(savedGeoPoint.id, file);
        }
      }

      onSave(savedGeoPoint);
    } catch (err: any) {
      console.error('Error saving geo point:', err);
      setError(err.message || 'Error al guardar el punto geográfico');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl ${className}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? 'Editar Punto Geográfico' : 'Crear Nuevo Punto Geográfico'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-4">
          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coordenadas */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Latitud *
              </label>
              <input
                type="number"
                step="0.000001"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Longitud *
              </label>
              <input
                type="number"
                step="0.000001"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Nivel de gravedad */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Nivel de Gravedad *
              </label>
              <select
                name="gravityLevel"
                value={formData.gravityLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={1}>Bajo (Verde)</option>
                <option value={2}>Medio (Amarillo)</option>
                <option value={3}>Alto (Rojo)</option>
              </select>
            </div>

            {/* Kilómetro */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Kilómetro
              </label>
              <input
                type="number"
                step="0.01"
                name="kilometer"
                value={formData.kilometer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sección */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Sección
              </label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Subida de imágenes */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Imágenes
              </label>

              <div className="flex items-center">
                <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer flex items-center">
                  <Upload size={18} className="mr-2" />
                  Seleccionar Imágenes
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Archivos seleccionados:
                  </h4>
                  <ul className="divide-y divide-gray-200 border border-gray-200 rounded">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="py-2 px-3 flex justify-between items-center">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            leftIcon={<Save size={18} />}
            isLoading={isLoading}
          >
            {isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GeoPointEditor;
