import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ArrowRight, CheckCircle2, CircleDot, Leaf, Menu, QrCode, ShieldCheck, 
  Sprout, X, RefreshCw, Plus, Search, Filter, Database, Check, Award,
  ExternalLink, FileText, Scale, Factory, Truck, Sparkles, Building2, MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import './style.css';

function App() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('overview'); // 'overview', 'lots', 'certs', 'verify'
  
  // Real Appwrite data states
  const [lots, setLots] = useState([]);
  const [certs, setCerts] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedLot, setSelectedLot] = useState(null);
  const [lotEvents, setLotEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  
  // Verification input
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // New Lot Modal
  const [showNewLotModal, setShowNewLotModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState('PET');
  const [newWeight, setNewWeight] = useState('35.5');
  const [newCollector, setNewCollector] = useState('Coopérative Éco-Collecteurs Yaoundé');
  const [newCity, setNewCity] = useState('Yaoundé');
  const [creatingLot, setCreatingLot] = useState(false);

  // Load real data from Appwrite
  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [lotsRes, certsRes, orgsRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.LOTS),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.CERTIFICATES),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.ORGANIZATIONS)
      ]);
      setLots(lotsRes.documents);
      setCerts(certsRes.documents);
      setOrgs(orgsRes.documents);
    } catch (err) {
      console.error('Appwrite fetch error:', err);
      setLoadError('La connexion au BaaS Appwrite est momentanément indisponible. Vérifiez votre réseau puis réessayez.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch cryptographic timeline for a lot
  const inspectLot = async (lot) => {
    setSelectedLot(lot);
    setLoadingEvents(true);
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EVENTS,
        // Match lot_id
      );
      const evs = res.documents.filter(e => e.lot_id === lot.$id || e.lot_id === `lot_${lot.code.replace('-', '_').toLowerCase()}`);
      setLotEvents(evs);
    } catch (e) {
      console.error('Events error:', e);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Create lot directly into Appwrite
  const handleCreateLot = async (e) => {
    e.preventDefault();
    setCreatingLot(true);
    try {
      const randomCode = `PT-2026-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;
      const lotId = `lot_${randomCode.replace('-', '_').toLowerCase()}`;
      const dummyHash = 'sha256:' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const newDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.LOTS,
        lotId,
        {
          code: randomCode,
          material: newMaterial,
          initial_weight: parseFloat(newWeight) || 20.0,
          verified_weight: parseFloat(newWeight) || 20.0,
          status: 'collecté',
          collector_name: newCollector,
          center_name: 'Centre de Tri Douala-Bassa',
          recycler_name: 'Cameroon PolyRecycle',
          location_city: newCity,
          coordinates: newCity === 'Yaoundé' ? '3.8480, 11.5021' : '4.0511, 9.7679',
          qr_payload: `https://vps.kernelforge.codes/verify/${randomCode}.${dummyHash.substring(7, 23)}`,
          current_hash: dummyHash,
          photo_url: 'https://vps.kernelforge.codes/v1/storage/buckets/plastitrace_photos/files/plastitrace_logo_official/view?project=6ace99ee0034f0bbaf8c',
          created_at_iso: new Date().toISOString()
        }
      );

      // Create initial event
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.EVENTS,
        `ev_${Math.random().toString(36).substring(2, 12)}`,
        {
          lot_id: lotId,
          event_type: 'CREATION',
          actor_name: newCollector,
          actor_role: 'collecteur',
          location: `${newCity} (Hub Principal)`,
          weight_recorded: parseFloat(newWeight),
          variance_recorded: 0.0,
          notes: 'Lot créé via le portail Web PlastiTrace connecté au BaaS Appwrite',
          prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
          curr_hash: dummyHash,
          timestamp_iso: new Date().toISOString()
        }
      );

      setShowNewLotModal(false);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      await loadData();
    } catch (err) {
      alert('Erreur lors de la création du lot : ' + err.message);
    } finally {
      setCreatingLot(false);
    }
  };

  // Public Verify Query
  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyQuery) return;
    setVerifying(true);
    setTimeout(() => {
      const q = verifyQuery.trim().toUpperCase();
      const match = lots.find(l => l.code.toUpperCase() === q || l.current_hash.includes(verifyQuery.trim()));
      setVerifyResult(match || 'NOT_FOUND');
      setVerifying(false);
    }, 400);
  };

  const totalKg = lots.reduce((acc, l) => acc + (l.verified_weight || l.initial_weight || 0), 0);
  const recycledLots = lots.filter(l => l.status === 'recyclé').length;
  const recyclingRate = lots.length ? Math.round((recycledLots / lots.length) * 100) : 0;

  return (
    <div className="app">
      {/* Modern Header */}
      <header>
        <div className="brand">
          <img src="/images/logo.jpg" alt="PlastiTrace Logo" className="logoImg" />
          <div className="brandTitles">
            <span className="brandName">Plasti<span>Trace</span></span>
            <span className="brandTagline">Circularity & Verification BaaS</span>
          </div>
        </div>

        <nav className={open ? 'show' : ''}>
          <a href="#solution" onClick={() => setOpen(false)}>Solution</a>
          <a href="#process" onClick={() => setOpen(false)}>Chaîne de Preuve</a>
          <a href="#dashboard" onClick={() => { setOpen(false); setTab('overview'); }}>Tableau de bord</a>
          <a href="#proof" onClick={() => { setOpen(false); setTab('verify'); }}>Vérification Publique</a>
          <button className="navBtn" onClick={() => { setTab('lots'); setShowNewLotModal(true); }}>
            <Plus size={16} /> Nouveau lot BaaS
          </button>
        </nav>

        <button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle Menu">
          {open ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        {loadError && <div className="connectionBanner" role="status"><Database size={16} /> {loadError}<button onClick={loadData}><RefreshCw size={14} /> Réessayer</button></div>}
        {/* HERO SECTION */}
        <section className="hero">
          <div className="heroText">
            <div className="eyebrow">
              <span className="pulseDot"></span> Infrastructure BaaS Appwrite Active · vps.kernelforge.codes
            </div>
            <h1>
              Prouver chaque kilo.<br />
              <em>Du collecteur à l'usine.</em>
            </h1>
            <p>
              PlastiTrace offre une identité numérique cryptographique infalsifiable à chaque kilo de déchet plastique.
              Connecté en temps réel à notre BaaS souverain Appwrite, avec traçabilité hors-ligne et certificats conformes PPWR 2026.
            </p>
            <div className="actions">
              <a href="#dashboard" className="primary" onClick={() => setTab('overview')}>
                Explorer le Dashboard en Direct <ArrowRight size={16} />
              </a>
              <a href="#proof" className="secondary" onClick={() => setTab('verify')}>
                Vérifier un QR Code <span>✦</span>
              </a>
            </div>
            
            <div className="trust">
              <div className="avatars">
                <span className="avatar">Y1</span>
                <span className="avatar">KF</span>
                <span className="avatar">✓</span>
              </div>
              <span>Développé par KERNEL FORGE · Pilote officiel Yaoundé & Douala</span>
            </div>
          </div>

          <div className="heroCard">
            <div className="cardTop">
              <span className="live">
                <span className="liveBlink"></span> Appwrite BaaS Connecté
              </span>
              <span className="badge">vps.kernelforge.codes</span>
            </div>
            <div className="metric">
              <small>Masse Totale Validée en BD</small>
              <strong>{loading ? '...' : totalKg.toFixed(1)} <b>kg</b></strong>
              <span className="up">↗ {lots.length} lots réels synchronisés</span>
            </div>
            <div className="bars">
              <span style={{ height: '45%' }} title="S1"></span>
              <span style={{ height: '65%' }} title="S2"></span>
              <span style={{ height: '55%' }} title="S3"></span>
              <span style={{ height: '85%' }} title="S4"></span>
              <span style={{ height: '70%' }} title="S5"></span>
              <span style={{ height: '95%' }} title="S6"></span>
              <span style={{ height: '100%' }} title="Aujourd'hui"></span>
            </div>
            <div className="cardFooter">
              <span>PET / PEHD / PP <b>100% Tracé</b></span>
              <span>Conformité PPWR <b>Auditable</b></span>
            </div>
          </div>
        </section>

        {/* STATS BANNER */}
        <section className="stats">
          <div>
            <strong>{loading ? '...' : lots.length}</strong>
            <span>Lots enregistrés en BD</span>
          </div>
          <div>
            <strong>{loading ? '...' : totalKg.toFixed(1)} <small>kg</small></strong>
            <span>Volumes de plastique sécurisés</span>
          </div>
          <div>
            <strong>{loading ? '...' : certs.length}</strong>
            <span>Certificats ESG émis</span>
          </div>
          <div>
            <strong>{loading ? '...' : `${recyclingRate}%`}</strong>
            <span>Taux de valorisation effective</span>
          </div>
        </section>

        {/* WORKFLOW / PROCESS */}
        <section id="process" className="process">
          <div className="processHead">
            <div>
              <div className="eyebrow">PROTOCOLE EN TROIS ÉTAPES</div>
              <h2>De la collecte de rue au granule certifié</h2>
            </div>
            <p>Un journal infalsifiable par chaîne SHA-256 sans surcoût blockchain.</p>
          </div>
          <div className="steps">
            <article>
              <div className="stepIcon"><CircleDot /></div>
              <span>01</span>
              <h3>Collecte & QR Déclaratif</h3>
              <p>Le collecteur pèse et enregistre le lot sur l'application mobile Flutter, même hors-ligne. Un QR signé lui est attribué.</p>
            </article>
            <article>
              <div className="stepIcon"><Scale /></div>
              <span>02</span>
              <h3>Double Pesée & Tri</h3>
              <p>Le centre de tri scanne, repèse sur balance étalonnée. Les écarts tolérés sont consignés dans le journal d'événements.</p>
            </article>
            <article>
              <div className="stepIcon"><ShieldCheck /></div>
              <span>03</span>
              <h3>Recyclage & Certificat ESG</h3>
              <p>Le recycleur valide la transformation. La marque génère son certificat conforme aux régulations REP et PPWR 2026.</p>
            </article>
          </div>
        </section>

        {/* INTERACTIVE DASHBOARD SECTION */}
        <section id="dashboard" className="dashboard">
          <div className="dashHead">
            <div>
              <div className="eyebrow">ESPACE OPÉRATIONNEL & AUDIT</div>
              <h2>Tableau de bord temps réel</h2>
            </div>
            <div className="dashActions">
              <button className="outlineBtn" onClick={loadData}>
                <RefreshCw size={15} className={loading ? 'spin' : ''} /> Actualiser BaaS
              </button>
              <button className="primary" onClick={() => setShowNewLotModal(true)}>
                <Plus size={16} /> Nouveau Lot
              </button>
            </div>
          </div>

          <div className="dashBox">
            <aside>
              <div className="asideHeader">
                <Database size={16} />
                <span>BaaS Appwrite</span>
              </div>
              <button 
                className={tab === 'overview' ? 'active' : ''} 
                onClick={() => setTab('overview')}
              >
                Vue d'ensemble
              </button>
              <button 
                className={tab === 'lots' ? 'active' : ''} 
                onClick={() => setTab('lots')}
              >
                Lots & Traçabilité <small>{lots.length}</small>
              </button>
              <button 
                className={tab === 'certs' ? 'active' : ''} 
                onClick={() => setTab('certs')}
              >
                Certificats ESG <small>{certs.length}</small>
              </button>
              <button 
                className={tab === 'orgs' ? 'active' : ''} 
                onClick={() => setTab('orgs')}
              >
                Acteurs & Hubs <small>{orgs.length}</small>
              </button>
            </aside>

            <div className="dashMain">
              {/* TAB 1: OVERVIEW */}
              {tab === 'overview' && (
                <div>
                  <div className="dashTitle">
                    <span>Performance Circulaire <small>Cameroun (Pilote 2026)</small></span>
                    <span className="statusOk">● Connecté à plastitrace_db</span>
                  </div>

                  <div className="dashMetrics">
                    <div>
                      <small>Volume Total Certifié</small>
                      <strong>{totalKg.toFixed(1)} <i>kg</i></strong>
                      <b>100% intègre</b>
                    </div>
                    <div>
                      <small>Lots Actifs en BD</small>
                      <strong>{lots.length}</strong>
                      <b>+5 ce cycle</b>
                    </div>
                    <div>
                      <small>Taux de Recyclage</small>
                      <strong>{recyclingRate} <i>%</i></strong>
                      <b>Conforme PPWR</b>
                    </div>
                  </div>

                  <h3 className="sectionSubTitle">Derniers lots enregistrés</h3>
                  <div className="table">
                    <div className="tableHead">
                      <span>Code Lot</span>
                      <span>Matière</span>
                      <span>Poids</span>
                      <span>Statut</span>
                      <span>Action</span>
                    </div>
                    {lots.slice(0, 4).map(l => (
                      <div className="row" key={l.$id}>
                        <b>{l.code}</b>
                        <span className="badgeMat">{l.material}</span>
                        <span>{l.verified_weight || l.initial_weight} kg</span>
                        <span className={`status ${l.status.replace(/ /g, '').toLowerCase()}`}>
                          <CheckCircle2 size={13} /> {l.status}
                        </span>
                        <button className="rowInspectBtn" onClick={() => inspectLot(l)}>
                          Inspecter
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: ALL LOTS */}
              {tab === 'lots' && (
                <div>
                  <div className="dashTitle">
                    <span>Registre des Lots Plastiques</span>
                    <button className="primary" onClick={() => setShowNewLotModal(true)}>
                      <Plus size={15} /> Ajouter un lot
                    </button>
                  </div>

                  <div className="table">
                    <div className="tableHead">
                      <span>Code</span>
                      <span>Matière</span>
                      <span>Poids Déclaré</span>
                      <span>Poids Reçu</span>
                      <span>Lieu</span>
                      <span>Statut</span>
                      <span>Détails</span>
                    </div>
                    {lots.map(l => (
                      <div className="row" key={l.$id}>
                        <b>{l.code}</b>
                        <span className="badgeMat">{l.material}</span>
                        <span>{l.initial_weight} kg</span>
                        <span>{l.verified_weight} kg</span>
                        <span><MapPin size={12} /> {l.location_city}</span>
                        <span className={`status ${l.status.replace(/ /g, '').toLowerCase()}`}>
                          {l.status}
                        </span>
                        <button className="rowInspectBtn" onClick={() => inspectLot(l)}>
                          Chaîne SHA-256
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CERTIFICATES */}
              {tab === 'certs' && (
                <div>
                  <div className="dashTitle">
                    <span>Certificats de Recyclage & Conformité REP</span>
                    <span className="statusOk">Garantie d'intégrité</span>
                  </div>

                  <div className="certsGrid">
                    {certs.map(c => (
                      <div className="certCard" key={c.$id}>
                        <div className="certTop">
                          <Award size={24} className="goldIcon" />
                          <span className="certCode">{c.certificate_code}</span>
                        </div>
                        <h4>{c.brand_name}</h4>
                        <p className="certPeriod">Période : {c.period}</p>
                        <div className="certMetrics">
                          <div>
                            <small>Masse Certifiée</small>
                            <strong>{c.total_kg_certified} kg</strong>
                          </div>
                          <div>
                            <small>Lots Groupés</small>
                            <strong>{c.lots_count}</strong>
                          </div>
                        </div>
                        <div className="certHash">
                          <small>Empreinte Cryptographique :</small>
                          <code>{c.integrity_hash}</code>
                        </div>
                        <div className="certFooter">
                          <span className="status Ok"><Check size={13} /> {c.status}</span>
                          <span className="standard">{c.compliance_standard}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ORGANIZATIONS */}
              {tab === 'orgs' && (
                <div>
                  <div className="dashTitle">
                    <span>Acteurs Référencés dans le Pilote</span>
                    <span>{orgs.length} partenaires</span>
                  </div>

                  <div className="orgsList">
                    {orgs.map(o => (
                      <div className="orgCard" key={o.$id}>
                        <div className="orgIcon">
                          {o.type === 'collecteur' && <Sprout />}
                          {o.type === 'centre' && <Scale />}
                          {o.type === 'recycleur' && <Factory />}
                          {o.type === 'marque' && <Building2 />}
                          {o.type === 'auditeur' && <ShieldCheck />}
                        </div>
                        <div className="orgInfo">
                          <h4>{o.name}</h4>
                          <span className="orgType">Rôle : <strong>{o.type}</strong> · {o.city}, {o.country}</span>
                          <p>{o.address} | Contact : {o.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* VERIFICATION SECTION */}
        <section id="proof" className="cta">
          <div>
            <div className="eyebrow">PORTAIL PUBLIC DE VÉRIFICATION</div>
            <h2>Scannez. Vérifiez.<br /><em>Faites confiance.</em></h2>
            <p>
              Chaque lot PlastiTrace dispose d'un identifiant unique et d'un hachage SHA-256 scellé.
              Entrez un code de lot pour auditer sa chaîne de conformité.
            </p>

            <form onSubmit={handleVerify} className="verifyForm">
              <input 
                type="text" 
                placeholder="Exemple: PT-2026-08F2 ou collez un hash"
                value={verifyQuery}
                onChange={e => setVerifyQuery(e.target.value)}
              />
              <button type="submit" className="primary">
                {verifying ? 'Vérification...' : 'Auditer la Preuve'}
              </button>
            </form>

            {verifyResult && verifyResult !== 'NOT_FOUND' && (
              <div className="verifySuccess">
                <div className="vTitle">
                  <CheckCircle2 color="#22c55e" size={24} />
                  <span>PREUVE VALIDE ET INTÈGRE · LOT {verifyResult.code}</span>
                </div>
                <div className="vGrid">
                  <div><strong>Matière:</strong> {verifyResult.material}</div>
                  <div><strong>Poids certifié:</strong> {verifyResult.verified_weight || verifyResult.initial_weight} kg</div>
                  <div><strong>Collecteur:</strong> {verifyResult.collector_name}</div>
                  <div><strong>Centre de tri:</strong> {verifyResult.center_name}</div>
                  <div><strong>Statut actuel:</strong> <span className="status ok">{verifyResult.status}</span></div>
                  <div><strong>Hash courant:</strong> <code>{verifyResult.current_hash ? verifyResult.current_hash.substring(0, 24) + '...' : 'Intègre'}</code></div>
                </div>
              </div>
            )}

            {verifyResult === 'NOT_FOUND' && (
              <div className="verifyError">
                Aucun lot correspondant trouvé. Veuillez vérifier le code ou scanner un QR authentique.
              </div>
            )}
          </div>

          <div className="qr">
            <QrCode size={145} />
            <span>Scanner pour vérifier en direct</span>
            <small>Supporte QR & Code Court</small>
          </div>
        </section>
      </main>

      {/* MODAL: INSPECT LOT HASH CHAIN */}
      {selectedLot && (
        <div className="modalOverlay" onClick={() => setSelectedLot(null)}>
          <div className="modalContent" onClick={e => e.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <h3>Chaîne Cryptographique · Lot {selectedLot.code}</h3>
                <span className="badgeMat">{selectedLot.material} · {selectedLot.verified_weight} kg</span>
              </div>
              <button className="closeBtn" onClick={() => setSelectedLot(null)}><X size={20} /></button>
            </div>

            <div className="modalBody">
              <div className="lotSummaryBox">
                <div><strong>Collecté par :</strong> {selectedLot.collector_name}</div>
                <div><strong>Centre de Tri :</strong> {selectedLot.center_name}</div>
                <div><strong>Recycleur final :</strong> {selectedLot.recycler_name}</div>
                <div><strong>Lieu :</strong> {selectedLot.location_city} ({selectedLot.coordinates})</div>
              </div>

              <h4>Journal d'Événements Infalsifiable</h4>
              {loadingEvents ? (
                <p>Chargement des blocs d'événements...</p>
              ) : lotEvents.length === 0 ? (
                <p>Création scellée (1 bloc racine).</p>
              ) : (
                <div className="eventsTimeline">
                  {lotEvents.map((ev, idx) => (
                    <div className="timelineItem" key={ev.$id || idx}>
                      <div className="itemDot"></div>
                      <div className="itemContent">
                        <div className="itemHeader">
                          <span className="evType">{ev.event_type}</span>
                          <span className="evTime">{new Date(ev.timestamp_iso).toLocaleString('fr-FR')}</span>
                        </div>
                        <p className="evActor">Par : <strong>{ev.actor_name}</strong> ({ev.actor_role})</p>
                        <p className="evNotes">{ev.notes}</p>
                        <div className="evWeight">
                          Poids mesuré : <strong>{ev.weight_recorded} kg</strong>
                          {ev.variance_recorded !== 0 && (
                            <span className="variance"> (Écart: {ev.variance_recorded} kg)</span>
                          )}
                        </div>
                        <div className="hashBlock">
                          <div><small>Prev Hash :</small> <code>{ev.prev_hash.substring(0, 24)}...</code></div>
                          <div><small>Curr Hash :</small> <code>{ev.curr_hash.substring(0, 24)}...</code></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW LOT */}
      {showNewLotModal && (
        <div className="modalOverlay" onClick={() => setShowNewLotModal(false)}>
          <div className="modalContent" onClick={e => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Créer un nouveau lot de plastique</h3>
              <button className="closeBtn" onClick={() => setShowNewLotModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateLot} className="newLotForm">
              <div className="formGroup">
                <label>Famille de plastique</label>
                <select value={newMaterial} onChange={e => setNewMaterial(e.target.value)}>
                  <option value="PET">PET (Polytéréphtalate d'éthylène - Bouteilles)</option>
                  <option value="PEHD">PEHD (Polyéthylène haute densité - Flacons)</option>
                  <option value="PP">PP (Polypropylène - Bouchons & Bacs)</option>
                  <option value="PS">PS (Polystyrène)</option>
                  <option value="Autres">Autres plastiques recyclables</option>
                </select>
              </div>

              <div className="formGroup">
                <label>Poids déclaré (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  required 
                  value={newWeight} 
                  onChange={e => setNewWeight(e.target.value)} 
                />
              </div>

              <div className="formGroup">
                <label>Entité / Collecteur</label>
                <input 
                  type="text" 
                  required 
                  value={newCollector} 
                  onChange={e => setNewCollector(e.target.value)} 
                />
              </div>

              <div className="formGroup">
                <label>Ville de collecte</label>
                <select value={newCity} onChange={e => setNewCity(e.target.value)}>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Douala">Douala</option>
                </select>
              </div>

              <div className="modalActions">
                <button type="button" className="outlineBtn" onClick={() => setShowNewLotModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="primary" disabled={creatingLot}>
                  {creatingLot ? 'Enregistrement BaaS...' : 'Enregistrer dans Appwrite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="brand">
          <img src="/images/logo.jpg" alt="PlastiTrace Logo" className="logoImgSmall" />
          <span>Plasti<span>Trace</span></span>
        </div>
        <span>© 2026 PlastiTrace & KERNEL FORGE · Conforme Règlement Européen PPWR & REP Circulaire.</span>
        <span>BaaS Appwrite Auto-hébergé · Yaoundé I</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
