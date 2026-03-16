import React, { useState, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Palette, Video, Code2, TrendingUp, Megaphone, Brain,
  CheckCircle2, AlertCircle, ArrowRight, Loader2,
  Link2, User, CalendarDays, Mail, Phone, MessageCircle,
  Plus, X, FileText, Sparkles, NotebookPen, MessageSquarePlus
} from 'lucide-react';

const DEPARTMENTS = [
  { id: 'graphic-design', label: 'Graphic Design', Icon: Palette },
  { id: 'video-editing',  label: 'Video Editing',  Icon: Video },
  { id: 'backend',        label: 'Back-End Dev',   Icon: Code2 },
  { id: 'marketing',      label: 'Marketing',      Icon: TrendingUp },
  { id: 'pr',             label: 'PR',             Icon: Megaphone },
  { id: 'ai',             label: 'AI',             Icon: Brain },
];

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ── Success Screen ── */
function SuccessPage({ onReset }) {
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon-wrap">
          <CheckCircle2 size={44} color="white" strokeWidth={2.5} />
        </div>
        <h2 className="success-title">تم الإرسال!</h2>
        <p className="success-sub">
          شكراً على اهتمامك بالانضمام لفريق Aithor<br />
          هيتم مراجعة طلبك والرد عليك في أقرب وقت.
        </p>
        <button className="btn-primary" onClick={onReset} style={{ margin: '0 auto' }}>
          تقديم طلب آخر <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* ── Skills Input Component ── */
function SkillsInput({ skills, onChange }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 12) {
      onChange([...skills, trimmed]);
      setInput('');
    }
  };

  const removeSkill = (s) => onChange(skills.filter(sk => sk !== s));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
    if (e.key === 'Backspace' && !input && skills.length) {
      onChange(skills.slice(0, -1));
    }
  };

  return (
    <div className="skills-wrapper" onClick={() => inputRef.current?.focus()}>
      {skills.map(skill => (
        <span key={skill} className="skill-tag">
          {skill}
          <button type="button" onClick={() => removeSkill(skill)} className="skill-remove">
            <X size={10} strokeWidth={3} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="skill-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addSkill}
        placeholder={skills.length === 0 ? 'اكتب مهارة واضغط Enter...' : ''}
        maxLength={30}
      />
    </div>
  );
}

/* ── Main Form ── */
function ApplicationForm() {
  const [form, setForm] = useState({
    name: '', age: '', email: '', phone: '', whatsapp: '',
    department: '', cvLink: '', portfolioLink: '',
    bio: '', additionalInfo: ''
  });
  const [skills, setSkills]         = useState([]);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                     e.name       = 'الاسم مطلوب';
    if (!form.age || form.age < 16 || form.age > 60)           e.age        = 'السن بين 16 و 60';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))       e.email      = 'بريد إلكتروني غير صحيح';
    if (!form.phone.trim())                                    e.phone      = 'رقم الهاتف مطلوب';
    if (!form.whatsapp.trim())                                 e.whatsapp   = 'رقم الواتساب مطلوب';
    if (!form.department)                                      e.department = 'اختر المجال';
    if (form.cvLink && !form.cvLink.startsWith('http'))        e.cvLink     = 'لازم يبدأ بـ http أو https';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleDept = (id) => {
    setForm({ ...form, department: id });
    if (errors.department) setErrors({ ...errors, department: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/applications`, {
        ...form,
        skills: JSON.stringify(skills)
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'حصل خطأ، حاول تاني');
    } finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ name: '', age: '', email: '', phone: '', whatsapp: '', department: '', cvLink: '', portfolioLink: '', bio: '', additionalInfo: '' });
    setSkills([]);
    setErrors({});
  };

  if (submitted) return <SuccessPage onReset={resetForm} />;

  const hasPersonal = form.name && form.age && form.email && form.phone && form.whatsapp;
  const hasDept     = !!form.department;
  const hasFiles    = !!form.cvLink || skills.length > 0;

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <div className="hero-section">
        <div className="hero-inner">
          <div className="hero-badge anim-fade-up">
            <span className="hero-badge-dot" />
            We&apos;re Hiring
          </div>
          <h1 className="hero-title">
            انضم لفريق{' '}
            <span className="hero-title-highlight">Aithor</span>
          </h1>
          <p className="hero-subtitle anim-fade-up anim-delay-2">
            بنبني مستقبل الذكاء الاصطناعي في مصر والمنطقة.<br />
            لو عندك موهبة وطموح — مكانك معانا.
          </p>
          <div className="hero-chips">
            {DEPARTMENTS.map(d => (
              <span key={d.id} className="hero-chip">
                <d.Icon size={15} strokeWidth={2} /> {d.label}
              </span>
            ))}
          </div>
        </div>
        <div className="scroll-indicator"><div className="scroll-line" /></div>
      </div>

      {/* ── FORM ── */}
      <div className="form-section">
        <div className="form-container">
          <form className="form-card" onSubmit={handleSubmit} noValidate>

            <div className="form-header">
              <div className="form-header-title">قدّم طلبك الآن</div>
              <div className="form-header-sub">املأ البيانات التالية وهنرد عليك في أقرب وقت</div>
            </div>

            {/* Progress */}
            <div className="form-progress">
              <div className={`progress-step ${hasPersonal ? 'done' : ''}`}>
                <div className="progress-dot" /> البيانات
              </div>
              <div className={`progress-line ${hasPersonal ? 'done' : ''}`} />
              <div className={`progress-step ${hasDept ? 'done' : ''}`}>
                <div className="progress-dot" /> المجال
              </div>
              <div className={`progress-line ${hasDept ? 'done' : ''}`} />
              <div className={`progress-step ${hasFiles ? 'done' : ''}`}>
                <div className="progress-dot" /> المهارات
              </div>
            </div>

            {/* ── Personal Info ── */}
            <div className="form-section-label">المعلومات الشخصية</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label"><User size={13} strokeWidth={2.5} /> الاسم كامل <span className="req">*</span></label>
                <input id="field-name" className={`form-input ${errors.name ? 'error' : ''}`}
                  name="name" value={form.name} onChange={handleChange} placeholder="محمد أحمد" />
                {errors.name && <span className="error-msg"><AlertCircle size={12} /> {errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label"><CalendarDays size={13} strokeWidth={2.5} /> السن <span className="req">*</span></label>
                <input id="field-age" className={`form-input ${errors.age ? 'error' : ''}`}
                  name="age" type="number" value={form.age} onChange={handleChange}
                  placeholder="22" min="16" max="60" />
                {errors.age && <span className="error-msg"><AlertCircle size={12} /> {errors.age}</span>}
              </div>
              <div className="form-group">
                <label className="form-label"><Mail size={13} strokeWidth={2.5} /> البريد الإلكتروني <span className="req">*</span></label>
                <input id="field-email" className={`form-input ${errors.email ? 'error' : ''}`}
                  name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                {errors.email && <span className="error-msg"><AlertCircle size={12} /> {errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label"><Phone size={13} strokeWidth={2.5} /> رقم الهاتف <span className="req">*</span></label>
                <input id="field-phone" className={`form-input ${errors.phone ? 'error' : ''}`}
                  name="phone" value={form.phone} onChange={handleChange} placeholder="01xxxxxxxxx" />
                {errors.phone && <span className="error-msg"><AlertCircle size={12} /> {errors.phone}</span>}
              </div>
              <div className="form-group full">
                <label className="form-label"><MessageCircle size={13} strokeWidth={2.5} /> رقم الواتساب <span className="req">*</span></label>
                <input id="field-whatsapp" className={`form-input ${errors.whatsapp ? 'error' : ''}`}
                  name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="01xxxxxxxxx" />
                {errors.whatsapp && <span className="error-msg"><AlertCircle size={12} /> {errors.whatsapp}</span>}
              </div>
            </div>

            {/* ── Department ── */}
            <div className="form-section-label">المجال الوظيفي</div>
            {errors.department && <p className="error-msg" style={{ marginBottom: 12 }}><AlertCircle size={12} /> {errors.department}</p>}
            <div className="dept-grid">
              {DEPARTMENTS.map(d => (
                <label key={d.id} className={`dept-option ${form.department === d.id ? 'selected' : ''}`}>
                  <input type="radio" name="department" value={d.id}
                    checked={form.department === d.id} onChange={() => handleDept(d.id)} />
                  <span className="dept-icon-wrap"><d.Icon size={24} strokeWidth={1.8} /></span>
                  <span className="dept-label">{d.label}</span>
                  <span className="dept-check"><CheckCircle2 size={14} strokeWidth={2.5} /></span>
                </label>
              ))}
            </div>

            {/* ── Skills ── */}
            <div className="form-section-label">المهارات</div>
            <div className="form-group full">
              <label className="form-label">
                <Sparkles size={13} strokeWidth={2.5} />
                مهاراتك
                <span className="portfolio-hint">(اضغط Enter بعد كل مهارة، حد أقصى 12)</span>
              </label>
              <SkillsInput skills={skills} onChange={setSkills} />
              {skills.length === 0 && (
                <div className="skills-hint">
                  مثال: Photoshop · Figma · React · Python · Content Writing
                </div>
              )}
            </div>

            {/* ── CV & Portfolio ── */}
            <div className="form-section-label">السيرة الذاتية والبورتفوليو</div>
            <div className="form-grid full" style={{ gap: 16 }}>

              {/* CV Link (Google Drive) */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={13} strokeWidth={2.5} />
                  رابط السيرة الذاتية (Google Drive)
                  <span className="portfolio-hint">(اختياري)</span>
                </label>
                <input
                  id="field-cvlink"
                  className={`form-input ${errors.cvLink ? 'error' : ''}`}
                  name="cvLink"
                  value={form.cvLink}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/..."
                  dir="ltr"
                />
                {errors.cvLink
                  ? <span className="error-msg"><AlertCircle size={12} /> {errors.cvLink}</span>
                  : (
                    <div className="input-hint">
                      ارفع الـ CV على Google Drive وشارك الرابط هنا — تأكد إن الرابط مسموح للكل يفتحه
                    </div>
                  )
                }
              </div>

              {/* Portfolio */}
              <div className="form-group">
                <label className="form-label">
                  <Link2 size={13} strokeWidth={2.5} />
                  رابط البورتفوليو
                  <span className="portfolio-hint">(اختياري)</span>
                </label>
                <input
                  id="field-portfolio"
                  className="form-input"
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleChange}
                  placeholder="https://behance.net/username أو github.com/user"
                  dir="ltr"
                />
              </div>

            </div>

            {/* ── About You ── */}
            <div className="form-section-label">عن نفسك</div>
            <div className="form-grid full" style={{ gap: 16 }}>

              <div className="form-group">
                <label className="form-label">
                  <NotebookPen size={13} strokeWidth={2.5} />
                  تكلم عن نفسك
                  <span className="portfolio-hint">(اختياري)</span>
                </label>
                <textarea
                  id="field-bio"
                  className="form-input form-textarea"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="اكتب عن نفسك، خبرتك، وإيه اللي بيخليك مناسب للدور ده..."
                  rows={4}
                  maxLength={800}
                />
                <div className="textarea-count">{form.bio.length}/800</div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MessageSquarePlus size={13} strokeWidth={2.5} />
                  إضافات أخرى
                  <span className="portfolio-hint">(اختياري)</span>
                </label>
                <textarea
                  id="field-additional"
                  className="form-input form-textarea"
                  name="additionalInfo"
                  value={form.additionalInfo}
                  onChange={handleChange}
                  placeholder="أي معلومات إضافية تحب تشاركها معانا — متاح للعمل متى؟ وقت part-time أو full-time؟ توقعات الراتب؟ أي حاجة تانية..."
                  rows={3}
                  maxLength={500}
                />
                <div className="textarea-count">{form.additionalInfo.length}/500</div>
              </div>

            </div>

            {/* Submit */}
            <button id="submit-application-btn" type="submit" className="submit-btn" disabled={submitting}>
              {submitting
                ? <><Loader2 size={18} className="spin-icon" /> جاري الإرسال...</>
                : <>قدّم طلبك الآن <ArrowRight size={18} /></>
              }
            </button>

          </form>
        </div>
      </div>
    </>
  );
}

export default ApplicationForm;
