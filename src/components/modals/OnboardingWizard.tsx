"use client";

import React, { ChangeEvent, useMemo, useState } from "react";
import { Sparkles, GraduationCap, Briefcase, Droplet, ArrowRight, Share2, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import { ALL_JNV_SCHOOLS } from "@/lib/seed/seed-schools";
import { ALL_CITIES_DATA } from "@/lib/seed/seed-cities";
import { ProfessionCategory, BloodGroup, JNVHouse } from "@/types";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { z } from "zod";
import { buildInitialsAvatarUrl, uploadImageToCloudinary } from "@/services/cloudinaryService";

const houseOptions: Array<{ value: JNVHouse; subtitle: string; dot: string; ring: string }> = [
  { value: "Aravali", subtitle: "Blue • Scholar Spirit", dot: "bg-blue-600", ring: "ring-blue-500" },
  { value: "Nilgiri", subtitle: "Green • Calm Resolve", dot: "bg-emerald-600", ring: "ring-emerald-500" },
  { value: "Shivalik", subtitle: "Red • Fierce Pride", dot: "bg-red-500", ring: "ring-red-500" },
  { value: "Udaigiri", subtitle: "Amber • Warm Leadership", dot: "bg-amber-500", ring: "ring-amber-500" },
];

const whatsappSchema = z.string().trim().refine((value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}, "Please enter a valid mobile number");

export function OnboardingWizard() {
  const { isOnboardingOpen, saveOnboarding, user } = useAuth();
  const { playTap, playSuccess, playWhoosh } = useSoundFX();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [selectedSchoolId, setSelectedSchoolId] = useState(user?.jnv_school_id || ALL_JNV_SCHOOLS[0].id);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [passingYear, setPassingYear] = useState<number>(user?.passing_year || 2018);
  const [selectedCityName, setSelectedCityName] = useState(user?.current_city || "Bengaluru");
  const [citySearch, setCitySearch] = useState("");
  const [professionCategory, setProfessionCategory] = useState<ProfessionCategory>(user?.profession_category || "IT & Software Engineering");
  const [professionRole, setProfessionRole] = useState(user?.profession_role || "Software Engineer");
  const [organization, setOrganization] = useState(user?.organization || "Tech Corp");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user?.blood_group || "O+");
  const [isBloodDonor, setIsBloodDonor] = useState<boolean>(user?.is_blood_donor ?? true);
  const [selectedHouse, setSelectedHouse] = useState<JNVHouse>(user?.jnv_house || "Aravali");
  const [showContactOnId, setShowContactOnId] = useState<boolean>(user?.show_contact_on_id ?? false);
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsapp_number || "+91-9876543210");
  const [bio, setBio] = useState(user?.bio || "Proud Navodayan!");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || buildInitialsAvatarUrl(fullName || "Navodayan"));
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<any>(null);

  const filteredSchools = useMemo(
    () =>
      ALL_JNV_SCHOOLS.filter(
        (s) =>
          s.school_name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
          s.district.toLowerCase().includes(schoolSearch.toLowerCase()) ||
          s.state.toLowerCase().includes(schoolSearch.toLowerCase())
      ).slice(0, 8),
    [schoolSearch]
  );

  const filteredCities = useMemo(
    () =>
      ALL_CITIES_DATA.filter(
        (c) => c.city.toLowerCase().includes(citySearch.toLowerCase()) || c.state.toLowerCase().includes(citySearch.toLowerCase())
      ).slice(0, 8),
    [citySearch]
  );

  if (!isOnboardingOpen) return null;

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const result = await uploadImageToCloudinary(file, "avatar");
      if (result) {
        setAvatarUrl(result);
        toast.success("Profile photo uploaded successfully.");
      } else {
        toast.info("Cloudinary keys are not configured yet; using a local avatar preview instead.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload profile photo.");
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleNext = () => {
    playTap();
    if (step === 1 && (!fullName || !selectedSchoolId)) {
      toast.error("Please enter your name and select your JNV school.");
      return;
    }
    if (step === 2 && (!selectedCityName || !professionRole)) {
      toast.error("Please specify your current city and profession role.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleFinish = () => {
    const parsed = whatsappSchema.safeParse(whatsappNumber);
    if (!parsed.success) {
      toast.error("Please enter a valid mobile / WhatsApp number (10-digit Indian or valid international format).");
      return;
    }

    const school = ALL_JNV_SCHOOLS.find((s) => s.id === selectedSchoolId) || ALL_JNV_SCHOOLS[0];
    const city = ALL_CITIES_DATA.find((c) => c.city === selectedCityName) || ALL_CITIES_DATA[0];

    const completed = saveOnboarding({
      full_name: fullName,
      avatar_url: avatarUrl,
      jnv_school_id: school.id,
      jnv_school_name: school.school_name,
      passing_year: Number(passingYear),
      current_city: city.city,
      current_state: city.state,
      current_country: city.country,
      city_lat: city.latitude,
      city_lng: city.longitude,
      profession_category: professionCategory,
      profession_role: professionRole,
      organization: organization,
      blood_group: bloodGroup,
      is_blood_donor: isBloodDonor,
      jnv_house: selectedHouse,
      show_contact_on_id: showContactOnId,
      whatsapp_number: whatsappNumber,
      bio: bio,
    });

    setCreatedProfile(completed);
    setStep(4);
    playSuccess();
    try {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } catch {
      // Ignore
    }
  };

  const shareBatchInvite = () => {
    playWhoosh();
    const text = encodeURIComponent(
      `🎉 I just minted my official Navodayan Network ID Card (${createdProfile?.navodayan_uid || "NVN"})! Connect with me and alumni across 660+ schools: https://navodayan.org`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success("WhatsApp batch invite opened!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 dark:bg-black/85 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800">
          <div className="h-full bg-gradient-to-r from-navy-800 to-amber-500 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider"><GraduationCap className="w-4 h-4" /><span>Step 1 of 3: JNV Alma Mater</span></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome Home, Navodayan!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Let&apos;s link your profile with your Vidyalaya campus and batch.</p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Arun Kumar" className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your JNV School (Search from all 660+ campuses)</label>
                <input type="text" value={schoolSearch} onChange={(e) => setSchoolSearch(e.target.value)} placeholder="Type school or district (e.g. Shimla, Gaya, Pune)..." className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white mb-2" />
                <div className="max-h-36 overflow-y-auto space-y-1 p-1 border border-slate-100 dark:border-zinc-800 rounded-xl">
                  {filteredSchools.map((s) => (
                    <div key={s.id} onClick={() => { playTap(); setSelectedSchoolId(s.id); setSchoolSearch(s.school_name); }} className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between ${selectedSchoolId === s.id ? "bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-white font-bold" : "hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"}`}>
                      <span className="truncate">{s.school_name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{s.state_code}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Passing Out Year (Class 12)</label>
                <select value={passingYear} onChange={(e) => setPassingYear(Number(e.target.value))} className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white">
                  {Array.from({ length: 48 }, (_, i) => 2033 - i).map((yr) => (
                    <option key={yr} value={yr}>Batch of {yr} {yr > 2024 ? "(Current Student)" : "(Alumni)"}</option>
                  ))}
                </select>
              </div>

              <button onClick={handleNext} className="w-full mt-4 py-2.5 px-4 text-xs font-bold text-white bg-navy-800 hover:bg-navy-900 rounded-xl flex items-center justify-center gap-1.5 transition-colors"><span>Continue to Step 2</span><ArrowRight className="w-4 h-4" /></button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider"><Briefcase className="w-4 h-4" /><span>Step 2 of 3: Location & Profession</span></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Where are you based now?</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current City (Indian Districts & Global Hubs)</label>
                <input type="text" value={citySearch} onChange={(e) => setCitySearch(e.target.value)} placeholder="Search city (e.g. Bengaluru, Delhi, London)..." className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white mb-2" />
                <div className="max-h-28 overflow-y-auto space-y-1 p-1 border border-slate-100 dark:border-zinc-800 rounded-xl">
                  {filteredCities.map((c) => (
                    <div key={c.city} onClick={() => { playTap(); setSelectedCityName(c.city); }} className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between ${selectedCityName === c.city ? "bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-white font-bold" : "hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"}`}>
                      <span>{c.city}</span>
                      <span className="text-[10px] text-slate-400">{c.country}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Profession Domain</label>
                <select value={professionCategory} onChange={(e) => setProfessionCategory(e.target.value as ProfessionCategory)} className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white">
                  <option value="IT & Software Engineering">IT & Software Engineering</option>
                  <option value="Civil Services & Government (IAS/IPS/SSC/Banking)">Civil Services & Government (IAS/IPS/SSC/Banking)</option>
                  <option value="Defence & Paramilitary (Army/Navy/Air Force/CAPF)">Defence & Paramilitary (Army/Navy/Air Force/CAPF)</option>
                  <option value="Medical & Healthcare (Doctor/Surgeon/Pharma)">Medical & Healthcare (Doctor/Surgeon/Pharma)</option>
                  <option value="Business, Startups & Entrepreneurship">Business, Startups & Entrepreneurship</option>
                  <option value="Core Engineering & PSUs (ISRO/DRDO/ONGC/NTPC)">Core Engineering & PSUs (ISRO/DRDO/ONGC/NTPC)</option>
                  <option value="Finance, CA, CS & Legal">Finance, CA, CS & Legal</option>
                  <option value="Education, Research & JNV Faculty">Education, Research & JNV Faculty</option>
                  <option value="Arts, Media, Design & Sports">Arts, Media, Design & Sports</option>
                  <option value="Current Student (School / College / Exam Aspirant)">Current Student (School / College / Exam Aspirant)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Designation</label>
                  <input type="text" required value={professionRole} onChange={(e) => setProfessionRole(e.target.value)} placeholder="e.g. Senior SDE" className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization / College</label>
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g. Google / AIIMS" className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => setStep(1)} className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 rounded-xl">Back</button>
                <button onClick={handleNext} className="w-2/3 py-2.5 px-4 text-xs font-bold text-white bg-navy-800 hover:bg-navy-900 rounded-xl flex items-center justify-center gap-1.5 transition-colors"><span>Continue to Step 3</span><ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider"><Droplet className="w-4 h-4 text-rose-500" /><span>Step 3 of 3: Emergency &amp; Contact</span></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Safety &amp; Networking</h2>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-rose-600 fill-rose-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Blood Group</span>
                  </div>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value as BloodGroup)} className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white">
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-rose-200/50 dark:border-rose-900/30">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Available for Emergency Blood Donation?</span>
                  <input type="checkbox" checked={isBloodDonor} onChange={(e) => setIsBloodDonor(e.target.checked)} className="w-4 h-4 accent-rose-600 rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select your JNV House</label>
                <div className="grid grid-cols-2 gap-2">
                  {houseOptions.map((house) => (
                    <button key={house.value} type="button" onClick={() => { setSelectedHouse(house.value); playTap(); }} className={`rounded-xl border px-3 py-2 text-left transition-all ${selectedHouse === house.value ? `border-transparent shadow-sm ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ${house.ring}` : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-slate-700 dark:text-slate-300"}`}>
                      <div className="flex items-center justify-between"><span className="text-xs font-bold">{house.value}</span><span className={`inline-block h-2.5 w-2.5 rounded-full ${house.dot}`} /></div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{house.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile / WhatsApp Number <span className="text-rose-600">*</span></label>
                <input type="tel" required value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+91-9876543210" className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white" />
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Mandatory for verified Navodayan networking &amp; SOS coordination. Your number remains private unless you choose to show it.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 p-3">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Show Mobile Number on ID Card</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Default is OFF for privacy.</div>
                  </div>
                  <button type="button" onClick={() => setShowContactOnId((v) => !v)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${showContactOnId ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-600"}`} aria-label="Toggle mobile visibility on ID card"><span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${showContactOnId ? "translate-x-6" : "translate-x-1"}`} /></button>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Profile Photo (optional)</label>
                <div className="flex items-center gap-3">
                  <img src={avatarUrl} alt="Profile preview" className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-zinc-700" />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isUploadingAvatar ? "Uploading..." : "Upload photo"}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Bio (Optional)</label>
                <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Share a hostel memory or what you're working on..." className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white" />
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => setStep(2)} className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 rounded-xl">Back</button>
                <button onClick={handleFinish} className="w-2/3 py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-navy-800 to-amber-600 hover:from-navy-900 hover:to-amber-700 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-navy-900/20 transition-all"><Sparkles className="w-4 h-4 text-amber-300" /><span>Generate My Unique ID</span></button>
              </div>
            </div>
          )}

          {step === 4 && createdProfile && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-md">🎓</div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Home, Navodayan!</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">Your credentials are officially verified. You have been auto-joined to your <span className="font-bold text-navy-800 dark:text-blue-400">School Group</span>, <span className="font-bold text-navy-800 dark:text-blue-400">Batch Group</span>, and <span className="font-bold text-navy-800 dark:text-blue-400">City Hub</span>.</p>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white border border-amber-500/30 shadow-xl max-w-xs mx-auto text-left relative overflow-hidden">
                <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">The Navodayan Network</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">VERIFIED</span></div>
                <div className="text-lg font-black tracking-tight">{createdProfile.full_name}</div>
                <div className="text-xs font-mono font-bold text-amber-400 mt-1">{createdProfile.navodayan_uid}</div>
                <div className="text-[11px] text-slate-300 mt-2 truncate">{createdProfile.jnv_school_name} • Batch of {createdProfile.passing_year}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{createdProfile.current_city} • Blood Group: {createdProfile.blood_group}</div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button onClick={shareBatchInvite} className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"><Share2 className="w-4 h-4" /><span>Invite Roommates / Batch on WhatsApp</span></button>
                <button onClick={() => { playSuccess(); window.location.reload(); }} className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-xl transition-colors">Enter Global Wall</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
