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

function useAuth() {
  return useContext(Ctx);
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('gk_token') || '');
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await req('GET', '/api/auth/me', null, token);
        setAgent(me.agent || me);
      } catch (e) {
        localStorage.removeItem('gk_token');
        setToken('');
        setAgent(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (loginValue, password) => {
    const d = await req('POST', '/api/auth/login', {
      login: loginValue,
      password
    });

    const newToken = d.token;
    if (!newToken) throw new Error('Token kelmadi');

    localStorage.setItem('gk_token', newToken);
    setToken(newToken);
    setAgent(d.agent || d.user || null);

    if (!d.agent && !d.user) {
      try {
        const me = await req('GET', '/api/auth/me', null, newToken);
        setAgent(me.agent || me);
      } catch (e) {
        // Login token saved, but profile endpoint may not exist yet.
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('gk_token');
    setToken('');
    setAgent(null);
  };

  return (
    <Ctx.Provider value={{ token, agent, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}


function Login() {
  const { login } = useAuth();

  const [mode, setMode] = useState('login'); // login | register
  const [f, setF] = useState({
    login: '',
    password: '',
    full_name: '',
    phone: '',
    company_name: ''
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const fv = k => v => setF(p => ({ ...p, [k]: v }));

  const goLogin = async () => {
    if (!f.login || !f.password) return setErr('Login va parol kiriting');

    setLoading(true);
    setErr('');
    setOk('');

    try {
      await login(f.login, f.password);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const goRegister = async () => {
    if (!f.full_name || !f.phone || !f.login || !f.password) {
      return setErr('Исм, телефон, login ва parol мажбурий');
    }

    setLoading(true);
    setErr('');
    setOk('');

    try {
      await req('POST', '/api/auth/register-public', {
        full_name: f.full_name,
        phone: f.phone,
        company_name: f.company_name,
        login: f.login,
        password: f.password
      });

      setOk('Муваффақиятли рўйхатдан ўтдингиз. 14 кунлик бепул муддат берилди. Энди киришингиз мумкин.');
      setMode('login');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:24,
      background:'linear-gradient(135deg,#1a8bc4,#534AB7)'
    }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48 }}>🏠</div>
          <div style={{ fontSize:24, fontWeight:700, color:'#fff', marginTop:8 }}>
            GK Network
          </div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,.75)', marginTop:4 }}>
            Риэлторлар платформаси
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:20, padding:24 }}>
          <div style={{
            display:'flex',
            background:'#f2f4f7',
            borderRadius:12,
            padding:4,
            marginBottom:16
          }}>
            <button
              onClick={() => { setMode('login'); setErr(''); setOk(''); }}
              style={{
                flex:1,
                padding:10,
                border:'none',
                borderRadius:9,
                background:mode==='login' ? '#2AABEE' : 'transparent',
                color:mode==='login' ? '#fff' : '#666',
                fontWeight:600,
                cursor:'pointer'
              }}
            >
              Кириш
            </button>

            <button
              onClick={() => { setMode('register'); setErr(''); setOk(''); }}
              style={{
                flex:1,
                padding:10,
                border:'none',
                borderRadius:9,
                background:mode==='register' ? '#2AABEE' : 'transparent',
                color:mode==='register' ? '#fff' : '#666',
                fontWeight:600,
                cursor:'pointer'
              }}
            >
              Рўйхатдан ўтиш
            </button>
          </div>

          {mode === 'register' && (
            <>
              {[
                ['Агент исми *','full_name','text','Ali Valiyev'],
                ['Телефон *','phone','tel','+998901234567'],
                ['Компания','company_name','text','Golden Key']
              ].map(([l,k,t,ph]) => (
                <div key={k} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, color:'#666', marginBottom:5 }}>{l}</div>
                  <input
                    type={t}
                    value={f[k]}
                    onChange={e => fv(k)(e.target.value)}
                    placeholder={ph}
                    style={{
                      width:'100%',
                      padding:'11px 14px',
                      fontSize:14,
                      border:'1.5px solid #e0e0e0',
                      borderRadius:10,
                      outline:'none'
                    }}
                  />
                </div>
              ))}
            </>
          )}

          {[
            ['Login *','login','text','login'],
            ['Парол *','password','password','parol']
          ].map(([l,k,t,ph]) => (
            <div key={k} style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:'#666', marginBottom:5 }}>{l}</div>
              <input
                type={t}
                value={f[k]}
                onChange={e => fv(k)(e.target.value)}
                placeholder={ph}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    mode === 'login' ? goLogin() : goRegister();
                  }
                }}
                style={{
                  width:'100%',
                  padding:'11px 14px',
                  fontSize:14,
                  border:'1.5px solid #e0e0e0',
                  borderRadius:10,
                  outline:'none'
                }}
              />
            </div>
          ))}

          {err && (
            <div style={{
              color:'#E24B4A',
              fontSize:13,
              marginBottom:12,
              padding:'9px 12px',
              background:'#FEE',
              borderRadius:8
            }}>
              {err}
            </div>
          )}

          {ok && (
            <div style={{
              color:'#0F6E56',
              fontSize:13,
              marginBottom:12,
              padding:'9px 12px',
              background:'#EFFFF8',
              borderRadius:8
            }}>
              {ok}
            </div>
          )}

          <button
            onClick={mode === 'login' ? goLogin : goRegister}
            disabled={loading}
            style={{
              width:'100%',
              padding:13,
              background:'#2AABEE',
              color:'#fff',
              border:'none',
              borderRadius:10,
              fontSize:15,
              fontWeight:600,
              cursor:'pointer'
            }}
          >
            {loading ? '...' : mode === 'login' ? 'Кириш' : 'Рўйхатдан ўтиш'}
          </button>

          {mode === 'register' && (
            <div style={{
              fontSize:12,
              color:'#777',
              textAlign:'center',
              marginTop:12,
              lineHeight:1.5
            }}>
              Рўйхатдан ўтгандан кейин 14 кунлик бепул муддат автомат берилади.
            </div>
          )}
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

// Properties section to ADD to App.jsx

function PropertyCard({ p, onClick }) {
  const purposeLabel = p.purpose === 'sell' ? '💰 Сотилади' : '🔑 Ижарага';
  const typeLabel = t => ({ apartment:'🏠 Квартира', house:'🏡 Ҳовли', office:'🏢 Офис', land:'🏗 Ер' })[t] || t;
  const statusColor = s => ({ active:'#0F6E56', reserved:'#854F0B', sold:'#888', inactive:'#E24B4A' })[s] || '#888';
  const statusLabel = s => ({ active:'Актив', reserved:'Банд', sold:'Сотилган', inactive:'Нофаол' })[s] || s;

  return (
    <div onClick={onClick} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:14, marginBottom:8, cursor:'pointer', overflow:'hidden' }}>
      {p.photos?.[0] && (
        <div style={{ height:130, overflow:'hidden', position:'relative' }}>
          <img src={p.photos[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', top:8, left:8, background:'rgba(0,0,0,.5)', color:'#fff', fontSize:10, padding:'2px 8px', borderRadius:5 }}>
            {purposeLabel}
          </div>
          {p.photos.length > 1 && (
            <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.45)', color:'#fff', fontSize:10, padding:'2px 8px', borderRadius:5 }}>
              {p.photos.length} расм
            </div>
          )}
        </div>
      )}
      <div style={{ padding:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <div>
            <div style={{ fontWeight:600, fontSize:13 }}>{p.display_id} · {typeLabel(p.property_type)}</div>
            <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
              {p.rooms && `${p.rooms} хона`}{p.area && ` · ${p.area}м²`}{p.floor && p.total_floors && ` · ${p.floor}/${p.total_floors}`}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#2AABEE' }}>${Number(p.price).toLocaleString()}</div>
            <div style={{ fontSize:10, color: statusColor(p.status), fontWeight:500 }}>{statusLabel(p.status)}</div>
          </div>
        </div>
        <div style={{ fontSize:11, color:'#888', marginBottom:6 }}>📍 {p.display_address || p.district || p.region || '—'}</div>
        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:6, borderTop:'1px solid #f0f0f0' }}>
          <span style={{ fontSize:11, color: p.is_own ? '#0F6E56' : '#888' }}>{p.is_own ? '✅ Ўзимники' : '🔒 Бошқа агент'}</span>
          {p.matched_clients > 0 && <span style={{ fontSize:11, color:'#534AB7' }}>{p.matched_clients} мос мижоз</span>}
        </div>
      </div>
    </div>
  );
}

function PropertyDetail({ prop, onBack, token }) {
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const API = 'https://gk-network-production.up.railway.app';

  useEffect(() => {
    if (tab === 'matches') {
      setLoading(true);
      fetch(`${API}/api/properties/${prop.id}/matches`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json()).then(setMatches).catch(console.error).finally(() => setLoading(false));
    }
  }, [tab]);

  const typeLabel = t => ({ apartment:'🏠 Квартира', house:'🏡 Ҳовли', office:'🏢 Офис', land:'🏗 Ер' })[t] || t;
  const photos = prop.photos || [];

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#534AB7', padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:8, width:32, height:32, color:'#fff', fontSize:18, cursor:'pointer' }}>←</button>
        <div><div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{prop.display_id}</div><div style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{typeLabel(prop.property_type)}</div></div>
      </div>

      {photos.length > 0 && (
        <div style={{ height:200, position:'relative', overflow:'hidden', background:'#f0f0f0' }}>
          <img src={photos[imgIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          {photos.length > 1 && (
            <>
              <button onClick={() => setImgIdx(i => i > 0 ? i-1 : photos.length-1)}
                style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,.4)', border:'none', borderRadius:'50%', width:32, height:32, color:'#fff', cursor:'pointer', fontSize:16 }}>‹</button>
              <button onClick={() => setImgIdx(i => i < photos.length-1 ? i+1 : 0)}
                style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,.4)', border:'none', borderRadius:'50%', width:32, height:32, color:'#fff', cursor:'pointer', fontSize:16 }}>›</button>
              <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', display:'flex', gap:4 }}>
                {photos.map((_, i) => <div key={i} style={{ width: i===imgIdx?14:6, height:6, borderRadius:3, background: i===imgIdx?'#fff':'rgba(255,255,255,.5)' }} />)}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ display:'flex', borderBottom:'1px solid #e8e8e8' }}>
        {['info','matches'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'10px', border:'none', background:'none', fontSize:13, fontWeight:tab===t?600:400, color:tab===t?'#534AB7':'#666', borderBottom:tab===t?'2px solid #534AB7':'2px solid transparent', cursor:'pointer' }}>
            {t === 'info' ? 'Маълумот' : 'Мос мижозлар'}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflow:'auto', padding:12 }}>
        {tab === 'info' ? (
          <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:14, padding:14 }}>
            {[
              ['Мақсади', prop.purpose==='sell'?'💰 Сотилади':'🔑 Ижарага'],
              ['Тури', typeLabel(prop.property_type)],
              ['Хоналар', prop.rooms ? `${prop.rooms} та` : '—'],
              ['Майдон', prop.area ? `${prop.area} м²` : '—'],
              ['Қавати', prop.floor && prop.total_floors ? `${prop.floor}/${prop.total_floors}` : '—'],
              ['Нарх', `$${Number(prop.price).toLocaleString()}`],
              ['Манзил', prop.is_own ? (prop.address || prop.district || '—') : (prop.district || '—')],
              ...(prop.is_own ? [
                ['Мулкдор', prop.owner_name || '—'],
                ['Мулкдор тел', prop.owner_phone || '—'],
              ] : [['Манзил','🔒 Яширин'],['Мулкдор','🔒 Яширин']]),
              ['Ипотека', prop.mortgage ? '✅ Мумкин' : '❌ Йўқ'],
              ['Муддатли', prop.installment ? '✅ Мумкин' : '❌ Йўқ'],
              ['Пост статус', prop.post_status === 'posted' ? '✅ Юборилди' : prop.post_status === 'failed' ? '❌ Хато' : '⏳ Кутилмоқда'],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f0f0f0', fontSize:13 }}>
                <span style={{ color:'#666' }}>{l}</span><span style={{ fontWeight:500, textAlign:'right', maxWidth:'60%' }}>{v}</span>
              </div>
            ))}
            {prop.description && <div style={{ marginTop:10, fontSize:13, color:'#444', lineHeight:1.6 }}>{prop.description}</div>}
          </div>
        ) : loading ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>Юкланмоқда...</div> :
          matches.length === 0 ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>👥 Мос мижоз топилмади</div> :
          matches.map(c => (
            <div key={c.id} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:14, padding:14, marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{c.display_name || c.display_id} {c.is_own ? '✅' : '🔒'}</span>
                <span style={{ fontSize:12, color:'#534AB7' }}>${Number(c.budget_max||0).toLocaleString()}</span>
              </div>
              <div style={{ fontSize:12, color:'#888', marginBottom:6 }}>
                {c.need_type==='buy'?'Сотиб олади':'Ижарага'} · {c.rooms && `${c.rooms} хона`}
              </div>
              {c.is_own && c.phone && (
                <button onClick={() => window.open(`tel:${c.phone}`)} style={{ padding:'7px 14px', background:'#534AB7', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer' }}>📞 Боғланиш</button>
              )}
              {!c.is_own && c.agent_phone && (
                <button onClick={() => window.open(`tel:${c.agent_phone}`)} style={{ width:'100%', padding:8, background:'#534AB7', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer' }}>📞 Агентга боғланиш</button>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}

function AddProperty({ onClose, onSave, token }) {
  const API = 'https://gk-network-production.up.railway.app';
  const [f, setF] = useState({ purpose:'', property_type:'', rooms:'', area:'', floor:'', total_floors:'', price:'', region:'', district:'', address:'', owner_name:'', owner_phone:'', description:'', mortgage:false, installment:false });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const fv = k => v => setF(p => ({ ...p, [k]:v }));

  const save = async () => {
    if (!f.purpose || !f.property_type || !f.price) return setErr('Мақсад, тур ва нарх киритинг');
    setLoading(true);
    try {
      const form = new FormData();
      Object.entries(f).forEach(([k,v]) => { if (v !== '' && v !== null) form.append(k, v); });
      photos.forEach(ph => form.append('photos', ph));
      const res = await fetch(`${API}/api/properties`, {
        method:'POST', headers:{ 'Authorization': `Bearer ${token}` }, body: form
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Xato');
      onSave();
    } catch(e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:200, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, maxHeight:'92vh', overflow:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontSize:16, fontWeight:600 }}>Янги объект</div>
          <button onClick={onClose} style={{ background:'#f5f5f5', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer' }}>✕</button>
        </div>

        {[['Мақсади *','purpose',[['sell','💰 Сотилади'],['rent','🔑 Ижарага']]],['Тури *','property_type',[['apartment','🏠 Квартира'],['house','🏡 Ҳовли'],['office','🏢 Офис'],['land','🏗 Ер']]]].map(([l,k,opts]) => (
          <div key={k} style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>{l}</div>
            <select value={f[k]} onChange={e => fv(k)(e.target.value)} style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14 }}>
              <option value="">Танланг...</option>
              {opts.map(([v,t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
        ))}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[['Хоналар','rooms'],['Майдон м²','area'],['Қавати','floor'],['Жами қават','total_floors']].map(([l,k]) => (
            <div key={k} style={{ marginBottom:8 }}>
              <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>{l}</div>
              <input type="number" value={f[k]} onChange={e => fv(k)(e.target.value)} style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14, outline:'none' }} />
            </div>
          ))}
        </div>

        {[['Нарх $ *','price','number'],['Туман/Вилоят','region','text'],['Манзил','address','text'],['Мулкдор исми','owner_name','text'],['Мулкдор телефони','owner_phone','tel']].map(([l,k,t]) => (
          <div key={k} style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>{l}</div>
            <input type={t} value={f[k]} onChange={e => fv(k)(e.target.value)} style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14, outline:'none' }} />
          </div>
        ))}

        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>Тавсиф</div>
          <textarea value={f.description} onChange={e => fv('description')(e.target.value)} rows={3}
            style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14, outline:'none', resize:'none' }} />
        </div>

        <div style={{ display:'flex', gap:16, marginBottom:12 }}>
          {[['mortgage','Ипотека'],['installment','Муддатли']].map(([k,l]) => (
            <label key={k} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={f[k]} onChange={e => fv(k)(e.target.checked)} />
              {l}
            </label>
          ))}
        </div>

        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>Расмлар (10 тагача)</div>
          <input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files))} style={{ fontSize:13 }} />
          {photos.length > 0 && <div style={{ fontSize:12, color:'#0F6E56', marginTop:4 }}>✅ {photos.length} та расм танланди</div>}
        </div>

        {err && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:10, padding:'8px 12px', background:'#FEE', borderRadius:8 }}>{err}</div>}
        <button onClick={save} disabled={loading} style={{ width:'100%', padding:13, background:'#534AB7', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:500, cursor:'pointer' }}>
          {loading ? '⏳ Юкланмоқда...' : '💾 Сақлаш ва Постлаш'}
        </button>
      </div>
    </div>
  );
}

function Properties({ token }) {
  const API = 'https://gk-network-production.up.railway.app';
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mine, setMine] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, [mine]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/properties${mine ? '?mine=true' : ''}`, { headers:{ 'Authorization': `Bearer ${token}` } });
      setProps(await r.json());
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  if (selected) return <PropertyDetail prop={selected} onBack={() => setSelected(null)} token={token} />;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#534AB7', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div><div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Объектлар</div><div style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{props.length} та</div></div>
        <button onClick={() => setShowAdd(true)} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:8, width:32, height:32, color:'#fff', fontSize:20, cursor:'pointer' }}>+</button>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #e8e8e8' }}>
        {[{v:false,l:'Барчаси'},{v:true,l:'Менинг'}].map(({v,l}) => (
          <button key={l} onClick={() => setMine(v)} style={{ flex:1, padding:'10px', border:'none', background:'none', fontSize:13, fontWeight:mine===v?600:400, color:mine===v?'#534AB7':'#666', borderBottom:mine===v?'2px solid #534AB7':'2px solid transparent', cursor:'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ flex:1, overflow:'auto', padding:12 }}>
        {loading ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>Юкланмоқда...</div> :
         props.length === 0 ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>🏠 Объектлар йўқ</div> :
         props.map(p => <PropertyCard key={p.id} p={p} onClick={() => setSelected(p)} />)}
      </div>
      {showAdd && <AddProperty onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load(); }} token={token} />}
    </div>
  );
}


function AddAgent({ onClose, onSave }) {
  const { token } = useAuth();
  const [f, setF] = useState({
    full_name: '',
    phone: '',
    login: '',
    password: '',
    company_id: '',
    role: 'agent'
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const fv = k => v => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.full_name || !f.phone || !f.login || !f.password) {
      return setErr('Исм, телефон, login ва parol мажбурий');
    }

    setLoading(true);
    setErr('');

    try {
      await req('POST', '/api/auth/register', {
        full_name: f.full_name,
        phone: f.phone,
        login: f.login,
        password: f.password,
        role: f.role || 'agent',
        company_id: f.company_id || null
      }, token);

      onSave();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:200, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, maxHeight:'92vh', overflow:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:600 }}>Янги агент</div>
            <div style={{ fontSize:12, color:'#888', marginTop:3 }}>14 кунлик бепул муддат автомат берилади</div>
          </div>
          <button onClick={onClose} style={{ background:'#f5f5f5', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer' }}>✕</button>
        </div>

        {[
          ['Агент исми *', 'full_name', 'text', 'Ali Valiyev'],
          ['Телефон *', 'phone', 'tel', '+998...'],
          ['Login *', 'login', 'text', 'ali'],
          ['Парол *', 'password', 'text', '123456'],
          ['Компания ID', 'company_id', 'text', 'Бўш қолса ҳам бўлади']
        ].map(([l, k, t, ph]) => (
          <div key={k} style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>{l}</div>
            <input
              type={t}
              value={f[k]}
              onChange={e => fv(k)(e.target.value)}
              placeholder={ph}
              style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14, outline:'none' }}
            />
          </div>
        ))}

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, color:'#666', marginBottom:4 }}>Роль</div>
          <select
            value={f.role}
            onChange={e => fv('role')(e.target.value)}
            style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e0e0e0', borderRadius:10, fontSize:14 }}
          >
            <option value="agent">Агент</option>
            <option value="admin">Админ</option>
          </select>
        </div>

        {err && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:10, padding:'8px 12px', background:'#FEE', borderRadius:8 }}>{err}</div>}

        <button onClick={save} disabled={loading} style={{ width:'100%', padding:13, background:'#0F6E56', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:500, cursor:'pointer' }}>
          {loading ? '⏳ Сақланмоқда...' : '✅ Агентни рўйхатдан ўтказиш'}
        </button>
      </div>
    </div>
  );
}

function AgentCard({ a }) {
  const status = a.subscription_status || 'trial';
  const trialEnd = a.trial_end ? new Date(a.trial_end).toLocaleDateString('ru-RU') : '—';
  const paidUntil = a.paid_until ? new Date(a.paid_until).toLocaleDateString('ru-RU') : '—';

  const statusText = {
    trial: '14 кунлик бепул',
    active: 'Тўланган',
    expired: 'Тўлов керак'
  }[status] || status;

  const statusColor = {
    trial: '#534AB7',
    active: '#0F6E56',
    expired: '#E24B4A'
  }[status] || '#888';

  return (
    <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:14, padding:14, marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', gap:10, marginBottom:8 }}>
        <div>
          <div style={{ fontWeight:600, fontSize:14 }}>{a.full_name || '—'}</div>
          <div style={{ fontSize:11, color:'#999', marginTop:2 }}>{a.display_id || '—'} · @{a.login}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11, color:statusColor, fontWeight:700 }}>{statusText}</div>
          <div style={{ fontSize:10, color:'#999', marginTop:2 }}>{a.role || 'agent'}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <div style={{ background:'#f7f7f7', borderRadius:10, padding:8 }}>
          <div style={{ fontSize:10, color:'#888' }}>Телефон</div>
          <div style={{ fontSize:12, fontWeight:500 }}>{a.phone || '—'}</div>
        </div>
        <div style={{ background:'#f7f7f7', borderRadius:10, padding:8 }}>
          <div style={{ fontSize:10, color:'#888' }}>Тўлов коди</div>
          <div style={{ fontSize:12, fontWeight:500 }}>{a.payment_code || '—'}</div>
        </div>
        <div style={{ background:'#f7f7f7', borderRadius:10, padding:8 }}>
          <div style={{ fontSize:10, color:'#888' }}>Trial тугайди</div>
          <div style={{ fontSize:12, fontWeight:500 }}>{trialEnd}</div>
        </div>
        <div style={{ background:'#f7f7f7', borderRadius:10, padding:8 }}>
          <div style={{ fontSize:10, color:'#888' }}>Тўланган муддат</div>
          <div style={{ fontSize:12, fontWeight:500 }}>{paidUntil}</div>
        </div>
      </div>
    </div>
  );
}

function Agents() {
  const { token, agent } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await req('GET', '/api/auth/agents', null, token);
      setAgents(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || 'Агентлар рўйхатини юклаб бўлмади');
    } finally {
      setLoading(false);
    }
  };

  if (agent?.role !== 'admin') {
    return (
      <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:20, textAlign:'center', color:'#999' }}>
        Бу бўлим фақат админ учун.
      </div>
    );
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#0F6E56', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Агентлар</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{agents.length} та</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:8, width:32, height:32, color:'#fff', fontSize:20, cursor:'pointer' }}>+</button>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:12 }}>
        {err && (
          <div style={{ color:'#E24B4A', fontSize:13, marginBottom:10, padding:'10px 12px', background:'#FEE', borderRadius:10 }}>
            {err}
            <div style={{ marginTop:6, color:'#777' }}>
              Backend'да GET /api/auth/agents route қўшилганини текширинг.
            </div>
          </div>
        )}

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>Юкланмоқда...</div> :
         agents.length === 0 ? <div style={{ textAlign:'center', padding:40, color:'#999' }}>👤 Агентлар йўқ</div> :
         agents.map(a => <AgentCard key={a.id} a={a} />)}
      </div>

      {showAdd && <AddAgent onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}


function AppInner() {
  const { agent, token, loading } = useAuth();
  const [tab, setTab] = useState('clients');

  if (loading) return <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#999' }}>Юкланмоқда...</div>;
  if (!agent) return <Login />;

  const menu = [
    ['clients','👥','Мижозлар'],
    ['properties','🏠','Объектлар'],
    ...(agent.role === 'admin' ? [['agents','👤','Агентлар']] : []),
    ['leads','🔄','Лидлар']
  ];

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', fontFamily:"'Onest', sans-serif" }}>
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {tab === 'clients' && <Clients />}
        {tab === 'properties' && <Properties token={token} />}
        {tab === 'agents' && <Agents />}
        {tab === 'leads' && <div style={{ padding:20, textAlign:'center', color:'#999', marginTop:60 }}>🔄 Лидлар</div>}
      </div>
      <div style={{ display:'flex', borderTop:'1px solid #e8e8e8', background:'#fff' }}>
        {menu.map(([k,icon,label]) => (
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
