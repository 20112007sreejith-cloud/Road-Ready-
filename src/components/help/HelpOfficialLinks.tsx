// src/components/help/HelpOfficialLinks.tsx
import React from 'react';
import { ExternalLink, ShieldCheck, HelpCircle, Phone, Globe, BookOpen } from 'lucide-react';

export const HelpOfficialLinks: React.FC = () => {
  const officialPortals = [
    {
      title: 'Parivahan Sewa (MoRTH)',
      desc: 'National citizen portal for vehicle registration, driving licences, and transport tax services.',
      url: 'https://parivahan.gov.in/',
      category: 'National Portal',
    },
    {
      title: 'SARATHI Driving Licence Portal',
      desc: 'National database for Learner Licences, DL renewals, duplicate licences, and address changes.',
      url: 'https://sarathi.parivahan.gov.in/',
      category: 'Licence Services',
    },
    {
      title: 'VAHAN Vehicle Registration Portal',
      desc: 'National register for vehicle ownership transfers, RC status, fitness, and inter-state NOCs.',
      url: 'https://parivahan.gov.in/vahan/',
      category: 'Vehicle Services',
    },
    {
      title: 'e-Challan Citizen Payment Portal',
      desc: 'Official portal to check and pay traffic violations and court challans across India.',
      url: 'https://echallan.parivahan.nic.in/',
      category: 'Traffic Penalties',
    },
    {
      title: 'API Setu Transport Collection',
      desc: 'Government API gateway providing documented developer endpoints for transport verification.',
      url: 'https://directory.apisetu.gov.in/api-collection/transport',
      category: 'Developer APIs',
    },
    {
      title: 'Karnataka Transport Department',
      desc: 'State transport commissionerate for Bengaluru RTO offices and user fee notifications.',
      url: 'https://transport.karnataka.gov.in/',
      category: 'State Transport (KA)',
    },
    {
      title: 'Maharashtra Motor Vehicles Department',
      desc: 'Official transport department portal for Mumbai, Pune, and Maharashtra RTO jurisdictions.',
      url: 'https://transport.maharashtra.gov.in/',
      category: 'State Transport (MH)',
    },
    {
      title: 'Odisha State Transport Authority',
      desc: 'Official portal for Odisha commerce and transport department services.',
      url: 'https://odishatransport.gov.in/',
      category: 'State Transport (OD)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Verified Official Government Portals & Citizen Helplines
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Verified Links
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Direct, verified links to official Ministry of Road Transport & Highways (MoRTH) portals and state authorities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            No Phishing • Authoritative Domains
          </span>
        </div>
      </div>

      {/* Honest Civic-Tech Transparency Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          CIVIC-TECH HACKATHON PROTOTYPE DISCLAIMER
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          RTO One is an independent workflow orchestration prototype engineered for <strong>Challenge 09 — Vehicle & Driving Services Made Simple</strong>. It is not an official government website, does not scrape authenticated portals, and does not pretend that simulated demo data represents live government records. When authorized APIs are integrated via API Setu, they operate through explicit citizen consent and documented adapters.
        </p>
      </div>

      {/* Official Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {officialPortals.map((portal) => (
          <div
            key={portal.title}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {portal.category}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  gov.in / nic.in
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-1">{portal.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{portal.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                {portal.url}
              </span>
              <a
                href={portal.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                Open Official Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency & Citizen Helplines */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-600" />
          Authoritative Citizen Helplines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Parivahan Citizen Helpdesk</span>
            <div className="font-bold text-slate-900 mt-1">0120-4925505</div>
            <p className="text-[10px] text-slate-400 mt-0.5">helpdesk-parivahan@gov.in</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">National Highway Emergency</span>
            <div className="font-bold text-slate-900 mt-1">1033 (Toll Free)</div>
            <p className="text-[10px] text-slate-400 mt-0.5">24x7 Roadside & Ambulance</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">National Cybercrime Helpline</span>
            <div className="font-bold text-slate-900 mt-1">1930 (Toll Free)</div>
            <p className="text-[10px] text-slate-400 mt-0.5">cybercrime.gov.in</p>
          </div>
        </div>
      </div>
    </div>
  );
};
