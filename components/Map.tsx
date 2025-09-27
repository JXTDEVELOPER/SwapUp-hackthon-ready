
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { Skill } from '../types';

interface MapProps {
  skills: Skill[];
  center: [number, number];
}

const Map: React.FC<MapProps> = ({ skills, center }) => {
  const position: LatLngExpression = [center[0], center[1]];

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg z-0">
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {skills.map(skill => skill.user && (
            <Marker key={skill.id} position={[skill.user.location.lat, skill.user.location.lng]}>
            <Popup>
                <div className="font-sans">
                    <h3 className="font-bold text-md">{skill.title}</h3>
                    <p className="text-sm text-slate-600">by {skill.user.fullName}</p>
                    <p className="text-sm mt-1">{skill.creditsPerHour} credits/hr</p>
                </div>
            </Popup>
            </Marker>
        ))}
        </MapContainer>
    </div>
  );
};

export default Map;
