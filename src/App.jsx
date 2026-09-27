import { useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [days, setDays] = useState(30);
  const [sender, setSender] = useState('');
  const [keyword, setKeyword] = useState('');
  const [removedCount, setRemovedCount] = useState(0);
  const [lastClean, setLastClean] = useState('—');
  const [loading, setLoading] = useState(false);

  const handleExecute = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/clean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days, sender, keyword }),
      });

      const data = await response.json();

      if (data.success) {
        setRemovedCount(data.removedCount);
        setLastClean(data.timestamp);
        alert(`Sucesso! ${data.message}`);
      } else {
        alert(data.message || 'Erro ao processar limpeza.');
      }
    } catch (error) {
      console.error('Erro ao comunicar com o backend:', error);
      alert('Erro ao conectar com o servidor backend. Verifique se ele está a correr.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>🧹 CleanMail</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Limpe sua caixa de entrada automaticamente.</p>
        
        {/* Link direto em formato de botão para garantir o redirecionamento OAuth */}
        <a 
          href={`${API_URL}/auth/google`}
          style={{ 
            display: 'inline-block',
            background: '#4285F4', 
            color: '#fff', 
            textDecoration: 'none',
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          🔗 Conectar Gmail
        </a>
      </div>

      <form onSubmit={handleExecute}>
        <fieldset style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '15px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: 'bold', fontSize: '14px' }}>Regras de limpeza</legend>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
              E-mails com mais de 
              <input 
                type="number" 
                value={days} 
                onChange={(e) => setDays(e.target.value)} 
                style={{ width: '45px', margin: '0 5px', textAlign: 'center' }} 
              /> 
              dias
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
              E-mails de 
              <input 
                type="text" 
                placeholder="remetente" 
                value={sender} 
                onChange={(e) => setSender(e.target.value)} 
                style={{ width: '110px', marginLeft: '5px', padding: '2px' }} 
              />
            </label>
          </div>

          <div>
            <label style={{ fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
              Assunto contém 
              <input 
                type="text" 
                placeholder="palavra" 
                value={keyword} 
                onChange={(e) => setKeyword(e.target.value)} 
                style={{ width: '100px', marginLeft: '5px', padding: '2px' }} 
              />
            </label>
          </div>
        </fieldset>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', background: loading ? '#999' : '#34A853', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
        >
          {loading ? 'A processar...' : '🧹 Executar limpeza'}
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#444', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p style={{ margin: '5px 0' }}>Última limpeza: {lastClean}</p>
        <p style={{ margin: '5px 0' }}>E-mails removidos: {removedCount}</p>
      </div>
    </div>
  );
}

export default App;