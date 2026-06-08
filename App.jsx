import { useState, useEffect, createContext, useContext } from 'react';

const API = 'https://gk-network-production.up.railway.app';

const req = async (method, path, body, token) => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Xato');
  return d;
};

const Ctx = createContext(null);

function AuthProvider({ children }) {
  const [agent, setAgent] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tk'));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (token) req('GET', '/api/auth/me', null, token).then(setAgent).catch(() => { setToken(null); localStorage.removeItem('tk'); }).finally(() => setLoading(false));
    else setLoading(false);
  }, [token]);
  const login = async (lg, pw) => {
    const d = await req('POST', '/api/auth/login', { login: lg, password: pw });
    localStorage.setItem('tk', d.token); setToken(d.token); setAgent(d.agent); return d;
  };
  return <Ctx.Provider value={{ agent, token, loading, login }}>{children}</Ctx.Provider>;
}

const useAuth = () => useContext(Ctx);

function Login() {
  const { login } = useAuth();
  const [f, setF] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const go = async () => {
    if (!f.login || !f.password) return setErr('Login va parol kiriting');
    setLoading(true); setErr('');
    try { await login(f.login, f.password); } catch(e) { setErr(e.message); } finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'linear-gradient(135deg,#1a8bc4,#534AB7)' }}>
      <div style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48 }}>🏠</div>
          <div style={{ fontSize:24, fontWeight:700, color:'#fff', marginTop:8 }}>GK Network</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,.7)', marginTop:4 }}>Риэлторлар платформаси</div>
        </div>
        <div style={{ background:'#fff', borderRadius:20, padding:24 }}>
          {[['Login','text','login'],['Парол','password','password']].map(([l,t,k]) => (
            <div key={k} style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:'#666', marginBottom:5 }}>{l}</div>
              <input type={t} value={f[k]} onChange={e => setF(p => ({ ...p, [k]: e.target.value }))} onKeyDown={e => e.key==='Enter' && go()}
                style={{ width:'100%', padding:'11px 14px', fontSize:14, border:'1.5px solid #e0e0e0', borderRadius:10, outline:'none' }} />
            </div>
          ))}
          {err && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:12, padding:'8px 12px', background:'#FEE', borderRadius:8 }}>{err}</div>}
          <button onClick={go} disabled={loading} style={{ width:'100%', padding:13, background:'#2AABEE', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:500, cursor:'pointer' }}>
            {loading ? '...' : 'Кириш'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientCard({ c, onClick }) {
  const tl = t => ({ apartment:'🏠 Квартира', house:'🏡 Ҳовли', office:'🏢 Офис', land:'🏗 Ер' })[t] || t;
  const nl = t => t === 'buy' ? 'Сотиб олади' : 'Ижарага';
  return (
    <div onClick={onClick} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:14, padding:14, marginBottom:8, cursor:'pointer' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ fontWeight:600, fontSize:14 }}>{c.full_name || '—'}</div>
        <div style={{ fontSize:11, color:'#999' }}>{c.display_id}</div>
      </div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
        {[tl(c.property_type), nl(c.need_type), c.rooms && `${c.rooms} хона`].filter(Boolean).map(t => (
          <span key={t} style={{ fontSize:11, padding:'2px 8px', borderRadius:5, background:'#E6F1FB', color:'#185FA5' }}>{t}</span>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:13, fontWeight:600 }}>{c.budget_max ? `$${Number(c.budget_max).toLocaleString()}` : '—'}</span>
        {c.matched_count > 0 && <span style={{ fontSize:11, color:'#534AB7' }}>{c.matched_count} мос объект</span>}
      </div>
    </div>
  );
}

function ClientDetail({ client, onBack }) {
  const { token } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('info');
  useEffect(() => {
    if (tab === 'matches') { setLoading(true); req('GET', `/api/clients/${client.id}/matches`, null, token).then(setMatches).catch(console.error).finally(() => setLoading(false)); }
  }, [tab]);
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#2AABEE', padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:8, width:32, height:32, color:'#fff', fontSize:18, cursor:'pointer' }}>←</button>
        <div><div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{client.full_name || client.display_id}</div><div style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{client.display_id}</div></div>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #e8e8e8' }}>
        {['info','matches'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'10px', border:'none', background:'none', fontSize:13, fontWeight:tab===t?600:400, color:tab===t?'#2AABEE':'#666', borderBottom:tab===t?'2px solid #2AABEE':'2px solid transparent', cursor:'pointer' }}>
            {t === 'info' ? 'Маълумот' : 'Мос объектлар'}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflow:'auto', padding:12 }}>
        {tab === 'info' ? (
          <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:14, padding:14 }}>
            {[['Мақсади',client.need_type==='buy'?'Сотиб олади':'Ижарага'],['Тури',client.property_type],['Хоналар',client.rooms||'—'],['Бюджет',client.budget_max?`$${Number(client.budget_max).toLocaleString()}`:'—'],['Телефон',client.phone||'—']].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f0f0f0', fontSize:13 }}>
                <span style={{ color:'#666' }}>{l}</span><span style={{ fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
        ) : loading ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>Юкланмоқда...</div> :
          matches.length === 0 ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>🏠 Мос объект топилмади</div> :
          matches.map(p => (
            <div key={p.id} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:14, padding:14, marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{p.display_id} {p.is_own ? '✅' : '🔒'}</span>
                <span style={{ fontSize:15, fontWeight:700, color:'#2AABEE' }}>${Number(p.price).toLocaleString()}</span>
              </div>
              <div style={{ fontSize:12, color:'#666', marginBottom:8 }}>📍 {p.display_address || p.district || p.region}</div>
              {p.is_own ? (
                p.owner_phone && <button onClick={() => window.open(`tel:${p.owner_phone}`)} style={{ padding:'7px 14px', background:'#2AABEE', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer' }}>📞 Боғланиш</button>
              ) : (
                <div>
                  <div style={{ fontSize:11, color:'#999', marginBottom:6 }}>🔒 Манзил яширин</div>
                  {p.agent_phone && <button onClick={() => window.open(`tel:${p.agent_phone}`)} style={{ width:'100%', padding:8, background:'#2AABEE', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer' }}>📞 Агентга боғланиш</button>}
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}

function AddClient({ onClose, onSave }) {
  const { token } = useAuth();
  const [f, setF] = useState({ need_type:'', property_type:'', rooms:'', budget_max:'', full_name:'', phone:'' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const save = async () => {
    if (!f.need_type || !f.property_type) return setErr('Тур ва мақсадни танланг');
    setLoading(true);
    try { await req('POST', '/api/clients', { ...f, rooms:f.rooms||null, budget_max:f.budget_max||null }, token); onSave(); }
    catch(e) { setErr(e.message); } finally { setLoading(false); }
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:200, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontSize:16, fontWeight:600 }}>Янги мижоз</div>
          <button onClick={onClose} style={{ background:'#f5f5f5', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer' }}>✕</button>
        </div>
        {[['Исм','text','full_name','Гуля'],['Телефон','tel','phone','+998...'],['Бюджет $','number','budget_max','25000'],['Хоналар','number','rooms','2']].map(([l,t,k,ph]) => (
          <div key={k} style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>{l}</div>
            <input type={t} value={f[k]} onChange={e => setF(p => ({ ...p, [k]:e.target.value }))} placeholder={ph}
              style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14, outline:'none' }} />
          </div>
        ))}
        {[['Мақсади','need_type',[['buy','Сотиб олади'],['rent','Ижарага']]],['Тури','property_type',[['apartment','🏠 Квартира'],['house','🏡 Ҳовли'],['office','🏢 Офис'],['land','🏗 Ер']]]].map(([l,k,opts]) => (
          <div key={k} style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>{l} *</div>
            <select value={f[k]} onChange={e => setF(p => ({ ...p, [k]:e.target.value }))} style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14 }}>
              <option value="">Танланг...</option>
              {opts.map(([v,t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
        ))}
        {err && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:10, padding:'8px 12px', background:'#FEE', borderRadius:8 }}>{err}</div>}
        <button onClick={save} disabled={loading} style={{ width:'100%', padding:13, background:'#2AABEE', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:500, cursor:'pointer' }}>
          {loading ? '...' : 'Сақлаш'}
        </button>
      </div>
    </div>
  );
}

function Clients() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { setClients(await req('GET', '/api/clients', null, token)); } catch(e) { console.error(e); } finally { setLoading(false); } };
  const filtered = clients.filter(c => !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.display_id?.includes(search));
  if (selected) return <ClientDetail client={selected} onBack={() => setSelected(null)} />;
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#2AABEE', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div><div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Мижозлар</div><div style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{clients.length} та</div></div>
        <button onClick={() => setShowAdd(true)} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:8, width:32, height:32, color:'#fff', fontSize:20, cursor:'pointer' }}>+</button>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:12 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Қидириш..." style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14, marginBottom:10, outline:'none' }} />
        {loading ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>Юкланмоқда...</div> :
         filtered.length === 0 ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>👥 Мижозлар йўқ</div> :
         filtered.map(c => <ClientCard key={c.id} c={c} onClick={() => setSelected(c)} />)}
      </div>
      {showAdd && <AddClient onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}

function AppInner() {
  const { agent, loading } = useAuth();
  const [tab, setTab] = useState('clients');
  if (loading) return <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#999' }}>Юкланмоқда...</div>;
  if (!agent) return <Login />;
  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', fontFamily:"'Onest', sans-serif" }}>
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {tab === 'clients' && <Clients />}
        {tab === 'properties' && <div style={{ padding:20, textAlign:'center', color:'#999', marginTop:60 }}>🏠 Объектлар</div>}
        {tab === 'leads' && <div style={{ padding:20, textAlign:'center', color:'#999', marginTop:60 }}>🔄 Лидлар</div>}
      </div>
      <div style={{ display:'flex', borderTop:'1px solid #e8e8e8', background:'#fff' }}>
        {[['clients','👥','Мижозлар'],['properties','🏠','Объектлар'],['leads','🔄','Лидлар']].map(([k,icon,label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'8px 4px 6px', border:'none', background:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:3, fontSize:9, fontWeight:500, cursor:'pointer', color:tab===k?'#2AABEE':'#aaa' }}>
            <span style={{ fontSize:20 }}>{icon}</span>{label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
