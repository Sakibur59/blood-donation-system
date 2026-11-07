'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Next.js এর জন্য আইকন ফিক্স (সার্ভার সাইডে এরর দিবে না)
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

export default function RequestMap({ requests, center = [23.8103, 90.4125] }) {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border dark:border-gray-700 relative z-0">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {requests?.map((req) => {
          if (!req.location?.coordinates || req.location.coordinates.length < 2) return null;
          
          const [lng, lat] = req.location.coordinates;
          
          return (
            <Marker key={req._id} position={[lat, lng]}>
              <Popup>
                <div className="text-sm font-sans">
                  <strong className="text-red-600 text-base">{req.bloodGroup} Needed</strong><br />
                  <b>Patient:</b> {req.patientName}<br />
                  <b>Qty:</b> {req.quantity} unit<br />
                  <span className="text-gray-500">{req.hospital}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}