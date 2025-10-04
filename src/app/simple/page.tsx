export default function SimpleTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff', 
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#2563eb',
          marginBottom: '1rem'
        }}>
          Simple Test Page
        </h1>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '2rem' 
        }}>
          If you can see this, basic HTML and CSS are working!
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div style={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '0.5rem', 
            padding: '1.5rem' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Test Card 1
            </h2>
            <p style={{ color: '#6b7280' }}>
              This is a simple test card with basic styling.
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '0.5rem', 
            padding: '1.5rem' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Test Card 2
            </h2>
            <p style={{ color: '#6b7280' }}>
              Testing basic layout and styling.
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '0.5rem', 
            padding: '1.5rem' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Test Card 3
            </h2>
            <p style={{ color: '#6b7280' }}>
              All basic elements should be visible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}