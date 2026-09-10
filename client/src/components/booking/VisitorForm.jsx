import { useState } from 'react';
import { IdCard, Mail, Phone, User } from 'lucide-react';

const FIELDS = [
  { key: 'name', label: '游客姓名', icon: User, placeholder: '与有效证件一致', type: 'text' },
  { key: 'phone', label: '手机号码', icon: Phone, placeholder: '用于接收入园通知', type: 'tel' },
  { key: 'email', label: '电子邮箱', icon: Mail, placeholder: '用于接收电子票凭证', type: 'email' },
  { key: 'idNumber', label: '身份证号', icon: IdCard, placeholder: '入园闸机核验使用', type: 'text' },
];

// 客户端校验规则（服务端会二次校验）
const VALIDATORS = {
  name: (v) => (v.trim().length >= 2 ? '' : '请填写至少 2 个字符的姓名'),
  phone: (v) => (/^1[3-9]\d{9}$/.test(v) ? '' : '请填写有效的 11 位手机号'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : '请填写有效的邮箱地址'),
  idNumber: (v) => (/^\d{17}[\dXx]$/.test(v) ? '' : '请填写有效的 18 位身份证号'),
};

export default function VisitorForm({ value, onChange, agreed, onAgreeChange, serverErrors }) {
  const [touched, setTouched] = useState({});

  const errors = {};
  for (const key of Object.keys(VALIDATORS)) {
    if (touched[key]) errors[key] = VALIDATORS[key](value[key] || '');
  }
  // 服务端返回的字段级错误优先展示
  Object.assign(errors, serverErrors || {});

  const setField = (key, v) => onChange({ ...value, [key]: v });

  return (
    <div className="border border-bone/10 bg-jungle-900/70 p-6">
      <h3 className="font-serif text-lg font-bold text-bone">游客信息</h3>
      <p className="mt-1 font-serif text-xs text-bone/40">
        请填写领队游客信息，其余同行游客入园时出示有效证件即可。
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {FIELDS.map(({ key, label, icon: Icon, placeholder, type }) => (
          <div key={key}>
            <label htmlFor={`visitor-${key}`} className="flex items-center gap-2 font-serif text-sm text-bone/70">
              <Icon className="h-4 w-4 text-amber/70" />
              {label}
            </label>
            <input
              id={`visitor-${key}`}
              type={type}
              value={value[key] || ''}
              placeholder={placeholder}
              onChange={(e) => setField(key, e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
              className={`mt-2 w-full border bg-jungle-950/80 px-4 py-3 font-serif text-sm text-bone placeholder:text-bone/25 focus:outline-none ${
                errors[key] ? 'border-red-500/60' : 'border-bone/15 focus:border-amber/70'
              }`}
            />
            {errors[key] && <p className="mt-1.5 font-serif text-xs text-red-400">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-bone/10 pt-5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreeChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-amber"
        />
        <span className="font-serif text-xs leading-relaxed text-bone/55">
          我已阅读并同意《侏罗纪公园安全协议》：知晓园区内存活史前生物，承诺全程听从安全员指挥，
          不擅自离开观光车辆与指定游览区域。
        </span>
      </label>
    </div>
  );
}

// 供父组件在提交前做整体校验；agreed 与复选框共用同一状态源
export function validateVisitor(value, agreed) {
  const errors = {};
  for (const key of Object.keys(VALIDATORS)) {
    const msg = VALIDATORS[key](value[key] || '');
    if (msg) errors[key] = msg;
  }
  if (!agreed) errors.__agreed = '请先阅读并同意安全协议';
  return errors;
}
