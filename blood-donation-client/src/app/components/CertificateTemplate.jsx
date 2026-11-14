'use client';
import { forwardRef } from 'react';
import { GiBlood } from 'react-icons/gi';
import { FaAward } from 'react-icons/fa';


const CertificateTemplate = forwardRef(({ user, totalDonations }, ref) => {
  return (
    <div 
      ref={ref} 
      style={{ 
        width: '900px', height: '650px', padding: '40px', 
        backgroundColor: '#ffffff', color: '#333333', 
        fontFamily: 'Arial, sans-serif', position: 'relative', 
        border: '12px solid #dc2626', boxSizing: 'border-box'
      }}
    >
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05 }}>
        <GiBlood size={400} color="#dc2626" />
      </div>
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <GiBlood size={80} color="#dc2626" style={{ margin: '0 auto' }} />
          <h1 style={{ fontSize: '38px', color: '#dc2626', fontWeight: 'bold', marginTop: '15px', marginBottom: '10px' }}>Certificate of Appreciation</h1>
          <p style={{ fontSize: '18px', color: '#666666' }}>This certificate is proudly presented to</p>
        </div>
        <div>
          <h2 style={{ fontSize: '46px', color: '#111111', borderBottom: '3px solid #dc2626', display: 'inline-block', padding: '0 40px 10px', margin: '25px 0', fontWeight: 'bold' }}>
            {user?.name || 'Hero'}
          </h2>
          <p style={{ fontSize: '20px', color: '#444444', maxWidth: '700px', margin: '0 auto', lineHeight: '1.5' }}>
            In recognition of your invaluable contribution. By donating blood <b>{totalDonations}</b> times, you have helped save up to <b>{totalDonations * 3}</b> lives.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 60px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ borderTop: '1px solid #333', paddingTop: '8px', fontSize: '16px', fontWeight: 'bold', margin: '0', width: '150px' }}>Date</p>
            <p style={{ fontSize: '14px', margin: '5px 0 0 0', color: '#666' }}>{new Date().toLocaleDateString()}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <FaAward size={60} color="#facc15" style={{ margin: '0 auto' }} />
            <p style={{ fontSize: '14px', color: '#dc2626', fontWeight: 'bold', marginTop: '5px', margin: '5px 0 0 0' }}>BloodLink Verified</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ borderTop: '1px solid #333', paddingTop: '8px', fontSize: '16px', fontWeight: 'bold', margin: '0', width: '150px' }}>Signature</p>
            <p style={{ fontFamily: 'cursive', fontSize: '20px', color: '#dc2626', margin: '5px 0 0 0' }}>BloodLink Team</p>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';


export default CertificateTemplate;