import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Save, Sparkles } from 'lucide-react';

export const TournamentSetup = () => {
  const { tournament, updateTournament } = useTournament();
  const [formData, setFormData] = useState({ ...tournament });
  const [savedMsg, setSavedMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTournament(formData);
    setSavedMsg('Tournament settings updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 select-none text-slate-100">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-400">Rules & Configuration</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Tournament Setup Console
        </h1>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
          {savedMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#0c0e1e] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Tournament Name</label>
            <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input-field py-2.5 px-3 w-full" />
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Sport Type</label>
            <input type="text" value={formData.sport || 'Football'} onChange={(e) => setFormData({ ...formData, sport: e.target.value })} required className="input-field py-2.5 px-3 w-full" />
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Season</label>
            <input type="text" value={formData.season || '2026 Season'} onChange={(e) => setFormData({ ...formData, season: e.target.value })} required className="input-field py-2.5 px-3 w-full" />
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Location / Arena</label>
            <input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="input-field py-2.5 px-3 w-full" />
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Default Squad Purse Budget</label>
            <input type="number" value={formData.defaultBudget || 5000} onChange={(e) => setFormData({ ...formData, defaultBudget: parseInt(e.target.value, 10) })} required className="input-field py-2.5 px-3 w-full" />
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Min Bid Increment</label>
            <input type="number" value={formData.minIncrement || 100} onChange={(e) => setFormData({ ...formData, minIncrement: parseInt(e.target.value, 10) })} required className="input-field py-2.5 px-3 w-full" />
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-slate-800">
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2 py-3 px-8 text-xs font-black"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            <Save className="w-4 h-4" />
            <span>Save Setup Config</span>
          </button>
        </div>
      </form>
    </div>
  );
};
