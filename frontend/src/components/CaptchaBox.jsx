import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * Self-contained CAPTCHA component.
 * Props:
 *   onValidate(bool) — called whenever validation state changes
 */
const CaptchaBox = ({ onValidate }) => {
  const [challenge, setChallenge] = useState({ text: '', answer: '' });
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateCaptcha = useCallback(() => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 15) + 1;
    const useAdd = Math.random() > 0.5;
    let text, answer;
    if (useAdd) {
      answer = (num1 + num2).toString();
      text = `${num1} + ${num2} = ?`;
    } else {
      const high = Math.max(num1, num2);
      const low = Math.min(num1, num2);
      answer = (high - low).toString();
      text = `${high} − ${low} = ?`;
    }
    setChallenge({ text, answer });
    setUserInput('');
    setIsValid(false);
    if (onValidate) onValidate(false);
  }, [onValidate]);

  useEffect(() => {
    generateCaptcha();
  }, []);  // run once on mount

  const handleChange = (e) => {
    const val = e.target.value.trim();
    setUserInput(val);
    const valid = val === challenge.answer;
    setIsValid(valid);
    if (onValidate) onValidate(valid);
  };

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-dark flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-deep-purple" />
          <span>Security Verification</span>
        </label>
        {isValid && (
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Captcha challenge display */}
        <div
          className="select-none font-mono font-black text-sm tracking-wider px-3.5 py-2 rounded-xl border border-light-purple/40 text-deep-purple flex items-center justify-center min-w-[130px]"
          style={{
            background: 'repeating-linear-gradient(45deg, #f3eaf6, #f3eaf6 10px, #faf8f5 10px, #faf8f5 20px)',
            letterSpacing: '3px',
          }}
        >
          {challenge.text}
        </div>

        {/* Answer input */}
        <input
          type="text"
          inputMode="numeric"
          placeholder="Answer"
          value={userInput}
          onChange={handleChange}
          maxLength={4}
          className={`flex-1 px-3 py-2 border rounded-xl text-xs font-bold text-center focus:outline-none transition-colors ${
            isValid
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : userInput
              ? 'border-red-300 bg-red-50 focus:border-deep-purple'
              : 'bg-cream/70 border-pale-purple focus:border-deep-purple'
          }`}
        />

        {/* Refresh */}
        <button
          type="button"
          onClick={generateCaptcha}
          className="p-2 rounded-xl bg-pale-purple text-deep-purple hover:bg-light-purple/20 transition-colors shrink-0"
          title="Refresh captcha"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {userInput && !isValid && (
        <p className="text-[10px] text-red-500 font-medium">
          Incorrect answer — try again or refresh ↺
        </p>
      )}
    </div>
  );
};

export default CaptchaBox;
