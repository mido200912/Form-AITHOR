import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import aithorLogo from '../assets/aithor-logo.png';
import {
  Palette, Video, Code2, TrendingUp, Megaphone, Brain,
  Clock, Eye, CheckCircle2, XCircle, Trash2, ExternalLink,
  Search, LogOut, Users, X, FileText, Phone, Mail,
  MessageCircle, CalendarDays, User, RefreshCw, Sparkles,
  Link2, NotebookPen, MessageSquarePlus
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEPT_LABELS = {
  'graphic-design': { label: 'Graphic Design', Icon: Palette },
  'video-editing':  { label: 'Video Editing',  Icon: Video },
  'backend':        { label: 'Back-End',        Icon: Code2 },
  'marketing':      { label: 'Marketing',       Icon: TrendingUp },
  'pr':             { label: 'PR',              Icon: Megaphone },
  'ai':             { label: 'AI',              Icon: Brain },
  'hr':             { label: 'HR',              Icon: Users },
};

const STATUS_CFG = {
  pending:  { label: 'قيد المراجعة', Icon: Clock,        cls: 'pending' },
  reviewed: { label: 'مراجعة',       Icon: Eye,          cls: 'reviewed' },
  accepted: { label: 'مقبول',        Icon: CheckCircle2, cls: 'accepted' },
  rejected: { label: 'مرفوض',        Icon: XCircle,      cls: 'rejected' },
};

function AdminDashboard() {
  const [apps, setApps]           = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [deptFilter, setDeptFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]         = useState(null);
  const navigate = useNavigate();

  const token   = localStorage.getItem('aithor_admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/applications`, { headers, params: { department: deptFilter, status: statusFilter, search } }),
        axios.get(`${API}/admin/stats`, { headers })
      ]);
      setApps(appsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('aithor_admin_token'); navigate('/admin/login'); }
    } finally { setLoading(false); }
  }, [deptFilter, statusFilter, search]);

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return; }
    fetchData();
  }, [fetchData, token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/admin/applications/${id}`, { status }, { headers });
      fetchData();
      if (selected?._id === id) setSelected(s => ({ ...s, status }));
    } catch { alert('Error updating'); }
  };

  const deleteApp = async (id) => {
    if (!confirm('هتمسح الطلب ده؟ مش هترجعه تاني!')) return;
    try {
      await axios.delete(`${API}/admin/applications/${id}`, { headers });
      fetchData();
      if (selected?._id === id) setSelected(null);
    } catch { alert('Error deleting'); }
  };

  const logout = () => { localStorage.removeItem('aithor_admin_token'); navigate('/admin/login'); };
  const fmt    = (d) => new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="dashboard-page">

      {/* ── Navbar ── */}
      <div className="dashboard-navbar">
        <div className="dashboard-logo">
          <img src={aithorLogo} alt="Aithor" />
          <span className="dashboard-logo-text">Aithor</span>
          <span className="dashboard-badge">ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="action-btn" onClick={fetchData} title="تحديث">
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          </button>
          <button className="btn-ghost" onClick={logout} id="admin-logout-btn">
            <LogOut size={14} /> تسجيل خروج
          </button>
        </div>
      </div>

      <div className="dashboard-body">

        {/* ── Stats ── */}
        <div className="stats-grid">
          <div className="stat-card featured">
            <div className="stat-label"><Users size={12} style={{ display:'inline', marginRight:4 }} />إجمالي الطلبات</div>
            <div className="stat-value">{stats.total ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label"><Clock size={12} style={{ display:'inline', marginRight:4 }} />قيد المراجعة</div>
            <div className="stat-value">{stats.pending ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label"><Eye size={12} style={{ display:'inline', marginRight:4 }} />مراجعة</div>
            <div className="stat-value">{stats.reviewed ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label"><CheckCircle2 size={12} style={{ display:'inline', marginRight:4 }} />مقبول</div>
            <div className="stat-value">{stats.accepted ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label"><XCircle size={12} style={{ display:'inline', marginRight:4 }} />مرفوض</div>
            <div className="stat-value">{stats.rejected ?? 0}</div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="filters-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }} />
            <input
              id="search-input"
              className="search-input"
              style={{ paddingLeft: 36 }}
              placeholder="بحث بالاسم أو الإيميل أو المهارة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select id="dept-filter" className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="all">كل المجالات</option>
            {Object.entries(DEPT_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select id="status-filter" className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">كل الحالات</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div className="filter-count">{apps.length} نتيجة</div>
        </div>

        {/* ── Table ── */}
        <div className="table-wrapper">
          <div className="table-top">
            <span className="table-title">طلبات التوظيف</span>
            <span className="table-count">{apps.length}</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw size={40} className="spin-icon" style={{ color:'var(--gray-200)', margin:'0 auto 12px', display:'block' }} />
              <div className="empty-title">جاري التحميل...</div>
            </div>
          ) : apps.length === 0 ? (
            <div className="empty-state">
              <FileText size={52} style={{ color:'var(--gray-200)', margin:'0 auto 12px', display:'block' }} />
              <div className="empty-title">لا توجد طلبات</div>
              <div className="empty-sub">لو اتقدم حد هتلاقيه هنا</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>المتقدم</th>
                    <th>المجال</th>
                    <th>التواصل</th>
                    <th>المهارات</th>
                    <th>CV</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map(app => {
                    const Dept   = DEPT_LABELS[app.department];
                    const Status = STATUS_CFG[app.status];
                    return (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight:700 }}>{app.name}</div>
                          <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:2 }}>{app.age} سنة</div>
                        </td>
                        <td>
                          <span className="dept-badge">
                            {Dept && <Dept.Icon size={12} strokeWidth={2} />}
                            {Dept?.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
                            <Mail size={11} color="var(--gray-400)" />
                            <span style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.email}</span>
                          </div>
                          <div style={{ fontSize:12, color:'var(--gray-400)', display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
                            <Phone size={10} /> {app.phone}
                          </div>
                        </td>
                        <td>
                          <div className="skill-tags-wrap">
                            {(app.skills || []).slice(0, 3).map(s => (
                              <span key={s} className="skill-tag-sm">{s}</span>
                            ))}
                            {app.skills?.length > 3 && (
                              <span className="skill-tag-sm">+{app.skills.length - 3}</span>
                            )}
                            {(!app.skills || app.skills.length === 0) && (
                              <span style={{ color:'var(--gray-300)', fontSize:12 }}>—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {app.cvLink
                            ? <a href={app.cvLink} target="_blank" rel="noreferrer"
                                className="action-btn accent" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>
                                <ExternalLink size={12} /> CV
                              </a>
                            : <span style={{ color:'var(--gray-300)', fontSize:12 }}>—</span>
                          }
                        </td>
                        <td>
                          {Status && (
                            <span className={`status-badge ${Status.cls}`}>
                              <Status.Icon size={11} strokeWidth={2.5} /> {Status.label}
                            </span>
                          )}
                        </td>
                        <td style={{ color:'var(--gray-400)', fontSize:12, whiteSpace:'nowrap' }}>
                          {fmt(app.createdAt)}
                        </td>
                        <td>
                          <div className="actions">
                            <button className="action-btn accent" onClick={() => setSelected(app)} title="عرض">
                              <Eye size={13} /> عرض
                            </button>
                            <button className="action-btn success" onClick={() => updateStatus(app._id, 'accepted')} title="قبول">
                              <CheckCircle2 size={13} />
                            </button>
                            <button className="action-btn danger"  onClick={() => deleteApp(app._id)} title="حذف">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-card">
            <div className="modal-title">
              تفاصيل المتقدم
              <button className="modal-close" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-key"><User size={10} style={{ display:'inline', marginRight:3 }} />الاسم</span>
                <span className="detail-val">{selected.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key"><CalendarDays size={10} style={{ display:'inline', marginRight:3 }} />السن</span>
                <span className="detail-val">{selected.age} سنة</span>
              </div>
              <div className="detail-item">
                <span className="detail-key"><Mail size={10} style={{ display:'inline', marginRight:3 }} />الإيميل</span>
                <span className="detail-val">{selected.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key"><Phone size={10} style={{ display:'inline', marginRight:3 }} />الهاتف</span>
                <span className="detail-val">{selected.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key"><MessageCircle size={10} style={{ display:'inline', marginRight:3 }} />الواتساب</span>
                <span className="detail-val">{selected.whatsapp}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key">المجال</span>
                <span className="detail-val" style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {DEPT_LABELS[selected.department] && React.createElement(DEPT_LABELS[selected.department].Icon, { size:15, strokeWidth:2 })}
                  {DEPT_LABELS[selected.department]?.label}
                </span>
              </div>

              {/* Skills */}
              <div className="detail-item full">
                <span className="detail-key"><Sparkles size={10} style={{ display:'inline', marginRight:3 }} />المهارات</span>
                {selected.skills?.length > 0
                  ? <div className="skill-tags-wrap" style={{ marginTop:6 }}>
                      {selected.skills.map(s => <span key={s} className="skill-tag-sm">{s}</span>)}
                    </div>
                  : <span style={{ color:'var(--gray-400)', fontSize:13 }}>لم تُذكر مهارات</span>
                }
              </div>

              {/* Bio */}
              {selected.bio && (
                <div className="detail-item full">
                  <span className="detail-key"><NotebookPen size={10} style={{ display:'inline', marginRight:3 }} />عن المتقدم</span>
                  <div className="detail-bio">{selected.bio}</div>
                </div>
              )}

              {/* Additional Info */}
              {selected.additionalInfo && (
                <div className="detail-item full">
                  <span className="detail-key"><MessageSquarePlus size={10} style={{ display:'inline', marginRight:3 }} />إضافات أخرى</span>
                  <div className="detail-bio">{selected.additionalInfo}</div>
                </div>
              )}

              {/* CV Link */}
              <div className="detail-item full">
                <span className="detail-key"><FileText size={10} style={{ display:'inline', marginRight:3 }} />رابط السيرة الذاتية</span>
                <span className="detail-val">
                  {selected.cvLink
                    ? <a href={selected.cvLink} target="_blank" rel="noreferrer"
                        style={{ color:'var(--black)', textDecoration:'underline', textUnderlineOffset:3, display:'flex', alignItems:'center', gap:5, fontSize:13 }}>
                        <ExternalLink size={13} /> فتح السيرة الذاتية
                      </a>
                    : <span style={{ color:'var(--gray-400)' }}>لم يُرفق CV</span>
                  }
                </span>
              </div>

              {/* Portfolio */}
              <div className="detail-item full">
                <span className="detail-key"><Link2 size={10} style={{ display:'inline', marginRight:3 }} />البورتفوليو</span>
                <span className="detail-val">
                  {selected.portfolioLink
                    ? <a href={selected.portfolioLink} target="_blank" rel="noreferrer"
                        style={{ color:'var(--black)', textDecoration:'underline', textUnderlineOffset:3, display:'flex', alignItems:'center', gap:5, fontSize:13 }}>
                        <ExternalLink size={13} /> {selected.portfolioLink}
                      </a>
                    : <span style={{ color:'var(--gray-400)' }}>لم يُرفق</span>
                  }
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-key">الحالة</span>
                {STATUS_CFG[selected.status] && (
                  <span className={`status-badge ${STATUS_CFG[selected.status].cls}`} style={{ marginTop:4 }}>
                    {React.createElement(STATUS_CFG[selected.status].Icon, { size:11, strokeWidth:2.5 })}
                    {STATUS_CFG[selected.status].label}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-key"><CalendarDays size={10} style={{ display:'inline', marginRight:3 }} />تاريخ التقديم</span>
                <span className="detail-val">{fmt(selected.createdAt)}</span>
              </div>
            </div>

            <div className="modal-actions">
              {selected.cvLink && (
                <a href={selected.cvLink} target="_blank" rel="noreferrer" className="action-btn accent" style={{ textDecoration:'none' }}>
                  <ExternalLink size={13} /> فتح CV
                </a>
              )}
              <button className="action-btn"        onClick={() => updateStatus(selected._id, 'reviewed')}>
                <Eye size={13} /> مراجعة
              </button>
              <button className="action-btn success" onClick={() => updateStatus(selected._id, 'accepted')}>
                <CheckCircle2 size={13} /> قبول
              </button>
              <button className="action-btn danger"  onClick={() => updateStatus(selected._id, 'rejected')}>
                <XCircle size={13} /> رفض
              </button>
              <button className="action-btn danger"  onClick={() => deleteApp(selected._id)}>
                <Trash2 size={13} /> حذف
              </button>
              <button className="btn-ghost"          onClick={() => setSelected(null)} style={{ marginLeft:'auto' }}>
                <X size={13} /> إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
