import {
  Post,
  NavodayanProfile,
  MentorshipListing,
  MentorshipRequest,
  BusinessListing,
  EmergencySOS,
  EventItem,
  TimeCapsule,
  HallOfFameEntry,
  ChatMessage,
  JNVSchool,
  CityData,
  PlatformFeedbackEntry,
  PlatformFeedbackStatus,
  PlatformFeedbackType,
} from "@/types";
import { ALL_JNV_SCHOOLS } from "@/lib/seed/seed-schools";
import { ALL_CITIES_DATA } from "@/lib/seed/seed-cities";
import {
  DEMO_PROFILES,
  DEMO_POSTS,
  DEMO_MENTORS,
  DEMO_BUSINESSES,
  DEMO_EMERGENCY_SOS,
  DEMO_EVENTS,
  DEMO_TIME_CAPSULES,
  DEMO_HALL_OF_FAME,
  DEMO_CHAT_MESSAGES,
} from "@/lib/seed/seed-demo";

// Client-side Local Storage & State Management with seeded defaults
class DataService {
  private posts: Post[] = [...DEMO_POSTS];
  private profiles: NavodayanProfile[] = [...DEMO_PROFILES];
  private mentors: MentorshipListing[] = [...DEMO_MENTORS];
  private mentorshipRequests: MentorshipRequest[] = [];
  private businesses: BusinessListing[] = [...DEMO_BUSINESSES];
  private sosAlerts: EmergencySOS[] = [...DEMO_EMERGENCY_SOS];
  private events: EventItem[] = [...DEMO_EVENTS];
  private capsules: TimeCapsule[] = [...DEMO_TIME_CAPSULES];
  private messages: ChatMessage[] = [...DEMO_CHAT_MESSAGES];
  private platformFeedback: PlatformFeedbackEntry[] = [];
  private currentUser: NavodayanProfile = { ...DEMO_PROFILES[0] };
  private isAuthenticated: boolean = true;
  private reports: { id: string; target_type: string; target_id: string; reporter_id: string; reason: string }[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.hydrateFromStorage();
    }
  }

  private hydrateFromStorage() {
    try {
      const storedPosts = localStorage.getItem("navodaya_posts");
      if (storedPosts) this.posts = JSON.parse(storedPosts);

      const storedUser = localStorage.getItem("navodaya_current_user");
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }

      const storedAuth = localStorage.getItem("navodaya_is_auth");
      if (storedAuth !== null) {
        this.isAuthenticated = storedAuth === "true";
      }

      const storedBusinesses = localStorage.getItem("navodaya_businesses");
      if (storedBusinesses) this.businesses = JSON.parse(storedBusinesses);

      const storedSOS = localStorage.getItem("navodaya_sos");
      if (storedSOS) this.sosAlerts = JSON.parse(storedSOS);

      const storedEvents = localStorage.getItem("navodaya_events");
      if (storedEvents) this.events = JSON.parse(storedEvents);

      const storedCapsules = localStorage.getItem("navodaya_capsules");
      if (storedCapsules) this.capsules = JSON.parse(storedCapsules);

      const storedMessages = localStorage.getItem("navodaya_messages");
      if (storedMessages) this.messages = JSON.parse(storedMessages);

      const storedFeedback = localStorage.getItem("navodaya_platform_feedback");
      if (storedFeedback) this.platformFeedback = JSON.parse(storedFeedback);
    } catch {
      // Fallback to in-memory seed
    }
  }

  private persist(key: string, data: unknown) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // Storage full or unavailable
      }
    }
  }

  // AUTH & ONBOARDING
  public getCurrentUser(): NavodayanProfile {
    return this.currentUser;
  }

  public getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public login(profile?: Partial<NavodayanProfile>) {
    this.isAuthenticated = true;
    if (profile) {
      this.currentUser = { ...this.currentUser, ...profile };
    }
    this.persist("navodaya_is_auth", true);
    this.persist("navodaya_current_user", this.currentUser);
  }

  public logout() {
    this.isAuthenticated = false;
    this.persist("navodaya_is_auth", false);
  }

  public completeOnboarding(profileData: Partial<NavodayanProfile>): NavodayanProfile {
    const stateCode = profileData.current_state ? profileData.current_state.substring(0, 2).toUpperCase() : "IN";
    const year = profileData.passing_year || 2026;
    const seq = Math.floor(1000 + Math.random() * 9000);
    const navodayan_uid = `NVN-${stateCode}-${year}-${seq}`;

    const updated: NavodayanProfile = {
      ...this.currentUser,
      ...profileData,
      navodayan_uid,
      onboarding_completed: true,
      is_verified: true,
      jnv_house: profileData.jnv_house || this.currentUser.jnv_house || "Aravali",
      show_contact_on_id: profileData.show_contact_on_id ?? this.currentUser.show_contact_on_id ?? false,
      role_type: profileData.role_type || (year > 2024 ? "student" : "alumni"),
    };

    this.currentUser = updated;
    this.isAuthenticated = true;

    // Also update in profiles list
    const existingIdx = this.profiles.findIndex((p) => p.id === updated.id);
    if (existingIdx >= 0) {
      this.profiles[existingIdx] = updated;
    } else {
      this.profiles.push(updated);
    }

    this.persist("navodaya_current_user", updated);
    this.persist("navodaya_is_auth", true);
    return updated;
  }

  // POSTS & WALL
  public getPosts(category?: string): Post[] {
    let list = [...this.posts].filter((p) => !p.is_hidden);
    if (category && category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createPost(data: Partial<Post>): Post {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author_id: this.currentUser.id,
      author_name: data.is_anonymous ? "A Fellow Navodayan" : this.currentUser.full_name,
      author_avatar: data.is_anonymous ? undefined : this.currentUser.avatar_url,
      author_school: this.currentUser.jnv_school_name,
      author_batch: this.currentUser.passing_year,
      author_uid: data.is_anonymous ? undefined : this.currentUser.navodayan_uid,
      school_id: this.currentUser.jnv_school_id,
      content: data.content || "",
      media_urls: data.media_urls || [],
      category: data.category || "general",
      is_safe_space: !!data.is_safe_space,
      is_anonymous: !!data.is_anonymous,
      poll_data: data.poll_data,
      reactions: { salute: 0, nostalgia: 0, proud_jnv: 0 },
      comments: [],
      report_count: 0,
      is_hidden: false,
      created_at: new Date().toISOString(),
    };

    this.posts.unshift(newPost);
    this.persist("navodaya_posts", this.posts);
    return newPost;
  }

  public reactToPost(postId: string, reactionType: string): Post | undefined {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return undefined;

    if (!post.reactions) post.reactions = {};

    if (post.user_reaction === reactionType) {
      post.reactions[reactionType] = Math.max(0, (post.reactions[reactionType] || 1) - 1);
      post.user_reaction = undefined;
    } else {
      if (post.user_reaction && post.reactions[post.user_reaction]) {
        post.reactions[post.user_reaction] = Math.max(0, post.reactions[post.user_reaction] - 1);
      }
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      post.user_reaction = reactionType;
    }

    this.persist("navodaya_posts", this.posts);
    return { ...post };
  }

  public votePoll(postId: string, optionIndex: number): Post | undefined {
    const post = this.posts.find((p) => p.id === postId);
    if (!post || !post.poll_data || !post.poll_data.options[optionIndex]) return undefined;

    const userId = this.currentUser.id;
    // Remove previous vote if any
    post.poll_data.options.forEach((opt) => {
      opt.votes = opt.votes.filter((id) => id !== userId);
    });

    // Add vote to chosen option
    post.poll_data.options[optionIndex].votes.push(userId);
    this.persist("navodaya_posts", this.posts);
    return { ...post };
  }

  public addComment(postId: string, content: string): Post | undefined {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return undefined;

    // Enforce Safe Space comment block
    if (post.is_safe_space || post.category === "safe_space") {
      throw new Error("Comments are disabled on Safe Space posts to ensure emotional safety.");
    }

    const comment = {
      id: `comment-${Date.now()}`,
      post_id: postId,
      author_id: this.currentUser.id,
      author_name: this.currentUser.full_name,
      author_avatar: this.currentUser.avatar_url,
      content,
      created_at: new Date().toISOString(),
    };

    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    this.persist("navodaya_posts", this.posts);
    return { ...post };
  }

  // 10-REPORT AUTO-BLOCK SYSTEM
  public reportItem(targetType: "post" | "profile" | "business", targetId: string, reason: string): boolean {
    const existing = this.reports.find(
      (r) => r.target_type === targetType && r.target_id === targetId && r.reporter_id === this.currentUser.id
    );
    if (existing) return false;

    this.reports.push({
      id: `report-${Date.now()}`,
      target_type: targetType,
      target_id: targetId,
      reporter_id: this.currentUser.id,
      reason,
    });

    if (targetType === "post") {
      const p = this.posts.find((item) => item.id === targetId);
      if (p) {
        p.report_count = (p.report_count || 0) + 1;
        if (p.report_count >= 10) {
          p.is_hidden = true;
        }
        this.persist("navodaya_posts", this.posts);
      }
    } else if (targetType === "profile") {
      const u = this.profiles.find((item) => item.id === targetId);
      if (u) {
        u.report_count = (u.report_count || 0) + 1;
        if (u.report_count >= 10) {
          u.is_blocked = true;
        }
      }
    } else if (targetType === "business") {
      const b = this.businesses.find((item) => item.id === targetId);
      if (b) {
        b.report_count = (b.report_count || 0) + 1;
        if (b.report_count >= 10) {
          b.approved_status = false;
        }
        this.persist("navodaya_businesses", this.businesses);
      }
    }
    return true;
  }

  // SCHOOLS
  public getAllSchools(): JNVSchool[] {
    return ALL_JNV_SCHOOLS;
  }

  public getSchoolBySlug(slug: string): JNVSchool | undefined {
    return ALL_JNV_SCHOOLS.find((s) => s.slug === slug);
  }

  public searchSchools(query: string, state?: string, region?: string): JNVSchool[] {
    const q = query.toLowerCase().trim();
    return ALL_JNV_SCHOOLS.filter((s) => {
      const matchQuery =
        !q ||
        s.school_name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.slug.includes(q);

      const matchState = !state || state === "all" || s.state.toLowerCase() === state.toLowerCase();
      const matchRegion = !region || region === "all" || s.region.toLowerCase() === region.toLowerCase();

      return matchQuery && matchState && matchRegion;
    });
  }

  // PROFILES & DIRECTORY
  public getProfiles(filters?: {
    state?: string;
    city?: string;
    schoolId?: string;
    passingYear?: number;
    profession?: string;
    bloodGroup?: string;
    bloodDonorsOnly?: boolean;
    query?: string;
  }): NavodayanProfile[] {
    let list = this.profiles.filter((p) => !p.is_blocked);

    if (!filters) return list;

    const q = filters.query?.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.profession_role.toLowerCase().includes(q) ||
          p.organization.toLowerCase().includes(q) ||
          p.current_city.toLowerCase().includes(q) ||
          (p.jnv_school_name && p.jnv_school_name.toLowerCase().includes(q))
      );
    }

    if (filters.state && filters.state !== "all") {
      list = list.filter((p) => p.current_state.toLowerCase() === filters.state?.toLowerCase());
    }

    if (filters.city && filters.city !== "all") {
      list = list.filter((p) => p.current_city.toLowerCase() === filters.city?.toLowerCase());
    }

    if (filters.schoolId && filters.schoolId !== "all") {
      list = list.filter((p) => p.jnv_school_id === filters.schoolId);
    }

    if (filters.passingYear) {
      list = list.filter((p) => p.passing_year === Number(filters.passingYear));
    }

    if (filters.profession && filters.profession !== "all") {
      list = list.filter((p) => p.profession_category === filters.profession);
    }

    if (filters.bloodGroup && filters.bloodGroup !== "all") {
      list = list.filter((p) => p.blood_group === filters.bloodGroup);
    }

    if (filters.bloodDonorsOnly) {
      list = list.filter((p) => p.is_blood_donor);
    }

    return list;
  }

  public getBloodDonors(city?: string, bloodGroup?: string): NavodayanProfile[] {
    return this.profiles.filter((p) => {
      const isDonor = p.is_blood_donor;
      const matchCity = !city || p.current_city.toLowerCase() === city.toLowerCase();
      const matchGroup = !bloodGroup || bloodGroup === "all" || p.blood_group === bloodGroup;
      return isDonor && matchCity && matchGroup;
    });
  }

  // MENTORSHIP
  public getMentors(category?: string): MentorshipListing[] {
    let list = [...this.mentors].filter((m) => m.is_active);
    if (category && category !== "all") {
      list = list.filter((m) => m.category === category);
    }
    return list;
  }

  public createMentorListing(data: Partial<MentorshipListing>): MentorshipListing {
    const listing: MentorshipListing = {
      id: `mentor-${Date.now()}`,
      mentor_id: this.currentUser.id,
      mentor_name: this.currentUser.full_name,
      mentor_avatar: this.currentUser.avatar_url,
      mentor_role: this.currentUser.profession_role,
      mentor_org: this.currentUser.organization,
      mentor_school: this.currentUser.jnv_school_name || "Navodaya Vidyalaya",
      mentor_batch: this.currentUser.passing_year,
      category: data.category || "work_life_corporate",
      expertise_tags: data.expertise_tags || ["Career Advice"],
      headline: data.headline || "",
      description: data.description || "",
      availability_note: data.availability_note,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    this.mentors.unshift(listing);
    return listing;
  }

  public requestMentorship(listingId: string, topic: string, message: string): MentorshipRequest {
    const listing = this.mentors.find((m) => m.id === listingId);
    const req: MentorshipRequest = {
      id: `mreq-${Date.now()}`,
      listing_id: listingId,
      mentee_id: this.currentUser.id,
      mentee_name: this.currentUser.full_name,
      mentor_id: listing ? listing.mentor_id : "unknown",
      topic,
      message,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    this.mentorshipRequests.push(req);
    return req;
  }

  // BUSINESS HUB
  public getBusinesses(category?: string, approvedOnly: boolean = true): BusinessListing[] {
    let list = [...this.businesses];
    if (approvedOnly) {
      list = list.filter((b) => b.approved_status);
    }
    if (category && category !== "all") {
      list = list.filter((b) => b.category.toLowerCase().includes(category.toLowerCase()));
    }
    return list;
  }

  public createBusinessListing(data: Partial<BusinessListing>): BusinessListing {
    const newBiz: BusinessListing = {
      id: `biz-${Date.now()}`,
      owner_id: this.currentUser.id,
      owner_name: this.currentUser.full_name,
      owner_school: this.currentUser.jnv_school_name || "Navodaya Vidyalaya",
      owner_batch: this.currentUser.passing_year,
      business_name: data.business_name || "New Venture",
      category: data.category || "Services",
      logo_url: data.logo_url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
      banner_url: data.banner_url,
      description: data.description || "",
      website_url: data.website_url,
      instagram_url: data.instagram_url,
      linkedin_url: data.linkedin_url,
      whatsapp_number: data.whatsapp_number || this.currentUser.whatsapp_number,
      phone_number: data.phone_number,
      email: data.email || this.currentUser.email,
      physical_address: data.physical_address,
      city: data.city || this.currentUser.current_city,
      navodayan_offer: data.navodayan_offer,
      approved_status: true, // auto-approved for demo ease
      report_count: 0,
      created_at: new Date().toISOString(),
    };

    this.businesses.unshift(newBiz);
    this.persist("navodaya_businesses", this.businesses);
    return newBiz;
  }

  // EMERGENCY SOS
  public getSOSAlerts(status?: "active" | "resolved"): EmergencySOS[] {
    let list = [...this.sosAlerts];
    if (status) {
      list = list.filter((s) => s.status === status);
    }
    return list.sort((a, b) => {
      // Critical first
      const weight = { critical: 3, important: 2, general: 1 };
      return weight[b.urgency_level] - weight[a.urgency_level];
    });
  }

  public createSOS(data: Partial<EmergencySOS>): EmergencySOS {
    const alert: EmergencySOS = {
      id: `sos-${Date.now()}`,
      user_id: this.currentUser.id,
      author_name: this.currentUser.full_name,
      author_school: this.currentUser.jnv_school_name || "Navodaya Vidyalaya",
      author_batch: this.currentUser.passing_year,
      urgency_level: data.urgency_level || "important",
      sos_type: data.sos_type || "blood_medical",
      required_blood_group: data.required_blood_group,
      title: data.title || "Emergency Request",
      description: data.description || "",
      target_city: data.target_city || this.currentUser.current_city,
      contact_phone: data.contact_phone || this.currentUser.whatsapp_number,
      status: "active",
      helpers_count: 0,
      created_at: new Date().toISOString(),
    };

    this.sosAlerts.unshift(alert);
    this.persist("navodaya_sos", this.sosAlerts);
    return alert;
  }

  public offerSOSHelp(sosId: string): EmergencySOS | undefined {
    const alert = this.sosAlerts.find((s) => s.id === sosId);
    if (!alert) return undefined;

    alert.helpers_count = (alert.helpers_count || 0) + 1;
    this.persist("navodaya_sos", this.sosAlerts);
    return { ...alert };
  }

  public resolveSOS(sosId: string): EmergencySOS | undefined {
    const alert = this.sosAlerts.find((s) => s.id === sosId);
    if (!alert) return undefined;

    alert.status = "resolved";
    this.persist("navodaya_sos", this.sosAlerts);
    return { ...alert };
  }

  // EVENTS
  public getEvents(): EventItem[] {
    return [...this.events].sort(
      (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );
  }

  public rsvpEvent(eventId: string, status: "going" | "interested" | "not_going"): EventItem | undefined {
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) return undefined;

    if (ev.user_rsvp === "going") ev.rsvps_going = Math.max(0, ev.rsvps_going - 1);
    if (ev.user_rsvp === "interested") ev.rsvps_interested = Math.max(0, ev.rsvps_interested - 1);

    if (status === "going") ev.rsvps_going++;
    if (status === "interested") ev.rsvps_interested++;

    ev.user_rsvp = status;
    this.persist("navodaya_events", this.events);
    return { ...ev };
  }

  public createEvent(data: Partial<EventItem>): EventItem {
    const ev: EventItem = {
      id: `event-${Date.now()}`,
      creator_id: this.currentUser.id,
      creator_name: this.currentUser.full_name,
      title: data.title || "Navodayan Meetup",
      description: data.description || "",
      event_date: data.event_date || new Date(Date.now() + 86400000 * 14).toISOString(),
      mode: data.mode || "offline",
      location_or_link: data.location_or_link || "TBD",
      city: data.city || this.currentUser.current_city,
      category: data.category || "city_meetup",
      banner_url: data.banner_url || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      rsvps_going: 1,
      rsvps_interested: 0,
      user_rsvp: "going",
      created_at: new Date().toISOString(),
    };

    this.events.unshift(ev);
    this.persist("navodaya_events", this.events);
    return ev;
  }

  // TIME CAPSULES
  public getTimeCapsules(schoolId?: string): TimeCapsule[] {
    if (schoolId) {
      return this.capsules.filter((c) => c.school_id === schoolId);
    }
    return this.capsules;
  }

  public toggleCapsuleUnlock(id: string): TimeCapsule | undefined {
    const cap = this.capsules.find((c) => c.id === id);
    if (!cap) return undefined;

    cap.is_unlocked = !cap.is_unlocked;
    this.persist("navodaya_capsules", this.capsules);
    return { ...cap };
  }

  public createTimeCapsule(data: Partial<TimeCapsule>): TimeCapsule {
    const cap: TimeCapsule = {
      id: `capsule-${Date.now()}`,
      school_id: data.school_id || this.currentUser.jnv_school_id,
      school_name: data.school_name || this.currentUser.jnv_school_name || "JNV Campus",
      batch_year: data.batch_year || this.currentUser.passing_year,
      creator_id: this.currentUser.id,
      creator_name: this.currentUser.full_name,
      title: data.title || `Class of ${this.currentUser.passing_year} Capsule`,
      unlock_date: data.unlock_date || new Date(Date.now() + 86400000 * 365).toISOString(),
      memories_json: data.memories_json || {
        dorm_stories: [],
        mess_memories: [],
        famous_slang: [],
        batch_secrets: [],
      },
      is_unlocked: false,
      created_at: new Date().toISOString(),
    };

    this.capsules.unshift(cap);
    this.persist("navodaya_capsules", this.capsules);
    return cap;
  }

  // HALL OF FAME
  public getHallOfFame(): HallOfFameEntry[] {
    return DEMO_HALL_OF_FAME;
  }

  // CHAT
  public getMessages(roomId: string): ChatMessage[] {
    return this.messages.filter((m) => m.room_id === roomId);
  }

  public sendMessage(roomId: string, content: string): ChatMessage {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: roomId,
      sender_id: this.currentUser.id,
      sender_name: this.currentUser.full_name,
      sender_avatar: this.currentUser.avatar_url,
      sender_school: this.currentUser.jnv_school_name,
      content,
      created_at: new Date().toISOString(),
    };

    this.messages.push(msg);
    this.persist("navodaya_messages", this.messages);
    return msg;
  }

  // PLATFORM FEEDBACK (BUG REPORTS + FEATURE SUGGESTIONS)
  public getPlatformFeedback(): PlatformFeedbackEntry[] {
    return [...this.platformFeedback].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public submitPlatformFeedback(input: {
    type: PlatformFeedbackType;
    page_url: string;
    description: string;
    contact_whatsapp?: string | null;
    user_id?: string | null;
  }): PlatformFeedbackEntry {
    const newFeedback: PlatformFeedbackEntry = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: input.user_id ?? this.currentUser?.id ?? null,
      type: input.type,
      page_url: input.page_url || "Unknown page",
      description: input.description.trim(),
      contact_whatsapp: input.contact_whatsapp?.trim() || null,
      status: "new",
      created_at: new Date().toISOString(),
    };

    this.platformFeedback.unshift(newFeedback);
    this.persist("navodaya_platform_feedback", this.platformFeedback);
    return { ...newFeedback };
  }

  public updatePlatformFeedbackStatus(
    id: string,
    status: PlatformFeedbackStatus
  ): PlatformFeedbackEntry | undefined {
    const item = this.platformFeedback.find((entry) => entry.id === id);
    if (!item) return undefined;

    item.status = status;
    this.persist("navodaya_platform_feedback", this.platformFeedback);
    return { ...item };
  }

  // CITIES & DIASPORA
  public getAllCities(): CityData[] {
    return ALL_CITIES_DATA;
  }
}

export const dataService = new DataService();
