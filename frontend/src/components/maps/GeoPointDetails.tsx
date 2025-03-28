import React, { useState, useEffect } from 'react';
import { IGeoPoint, IGeoPointImage } from '../../types/geoPoint.types';
import { geoPointService } from '../../services';
import { X, Download, Image } from 'lucide-react';
import Card from '../common/Card';

interface GeoPointDetailsProps {
  geoPoint: IGeoPoint;
  onClose?: () => void;
  className?: string;
}

const GeoPointDetails: React.FC<GeoPointDetailsProps> = ({
  geoPoint,
  onClose,
  className = ''
}) => {
  const [images, setImages] = useState<IGeoPointImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<IGeoPointImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!geoPoint || !geoPoint.id) return;

      setLoading(true);
      setError(null);

      try {
        const imageList = await geoPointService.getGeoPointImages(geoPoint.id);
        setImages(imageList);
      } catch (err: any) {
        console.error('Error fetching geo point images:', err);
        setError('No se pudieron cargar las imágenes asociadas.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [geoPoint]);

  // Nivel de gravedad como texto
  const gravityLevelText =
    geoPoint.gravityLevel === 1 ? 'Bajo (Verde)' :
    geoPoint.gravityLevel === 2 ? 'Medio (Amarillo)' :
    geoPoint.gravityLevel === 3 ? 'Alto (Rojo)' : 'Desconocido';

  // Clase CSS para el color del nivel de gravedad
  const gravityColorClass =
    geoPoint.gravityLevel === 1 ? 'bg-green-100 text-green-800' :
    geoPoint.gravityLevel === 2 ? 'bg-yellow-100 text-yellow-800' :
    geoPoint.gravityLevel === 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';

  return (
    <Card
      className={`max-w-2xl ${className}`}
      title={`Punto: ${geoPoint.kilometer ? `${geoPoint.kilometer} km` : 'Sin km'}`}
      icon={<Image size={20} className="text-blue-600" />}
      actions={onClose && (
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      )}
    >
      <div className="space-y-4">
        {/* Información del punto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Información general</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-500">Coordenadas:</span>{' '}
                <span className="font-medium">{geoPoint.latitude.toFixed(6)}, {geoPoint.longitude.toFixed(6)}</span>
              </li>
              {geoPoint.section && (
                <li>
                  <span className="text-gray-500">Sección:</span>{' '}
                  <span className="font-medium">{geoPoint.section}</span>
                </li>
              )}
              <li>
                <span className="text-gray-500">Nivel de gravedad:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${gravityColorClass}`}>
                  {gravityLevelText}
                </span>
              </li>
            </ul>
          </div>

          {geoPoint.description && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Descripción</h3>
              <p className="text-gray-600">{geoPoint.description}</p>
            </div>
          )}
        </div>

        {/* Galería de imágenes */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Imágenes</h3>

          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
              {error}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center p-4 text-gray-500 italic">
              No hay imágenes asociadas a este punto.
            </div>
          ) : (
            <div>
              {/* Vista previa de imagen seleccionada */}
              {selectedImage && (
                <div className="mb-4">
                  <div className="relative">
                    <img
                      src={`/api/files/${selectedImage.id}/download`}
                      alt={selectedImage.fileName}
                      className="w-full h-auto rounded"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <a
                        href={`/api/files/${selectedImage.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        title="Descargar imagen"
                      >
                        <Download size={18} className="text-gray-700" />
                      </a>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        title="Cerrar vista previa"
                      >
                        <X size={18} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    {selectedImage.fileName}
                  </p>
                </div>
              )}

              {/* Miniaturas de imágenes */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={`/api/files/${image.id}/download`}
                        alt={image.fileName}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GeoPointDetails;
