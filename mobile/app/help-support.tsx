import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/hooks/useTickets';
import { api, Clinic, SupportTicket, Vet } from '@/lib/api';
import { Stack, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  HelpCircle,
  MessageSquarePlus,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    question: 'How do I add a new pet to my profile?',
    answer:
      'Go to the Home tab and tap the "+" button in the My Pets section. Fill in your pet\'s details and tap Save.',
  },
  {
    question: 'How do I book an appointment?',
    answer:
      'From the Home or Discover tab, select a clinic and tap "Book Appointment". Choose a date, select your pet, and confirm.',
  },
  {
    question: 'Can I cancel an appointment?',
    answer:
      'Yes. Open your appointment details and tap "Cancel Appointment". Note that cancellations may be subject to clinic policies.',
  },
  {
    question: 'How do I view my invoices?',
    answer:
      'Your invoices are visible on the Home screen under the Invoices section. Tap any invoice card to see full details.',
  },
  {
    question: 'What is the AI Skin Checker?',
    answer:
      'The AI Skin Checker lets you photograph your pet\'s skin concern. Our AI analyses the image and provides a preliminary assessment — always consult a vet for diagnosis.',
  },
  {
    question: 'How long does it take to resolve a support ticket?',
    answer:
      'Most tickets are reviewed within 1–2 business days. You can check the status of your ticket on this page.',
  },
];

// ─── Status helpers ────────────────────────────────────────────────────────────
type VetWithClinic = Vet & { clinicId: string; clinicName: string };

interface ClinicMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isOwner: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; icon: React.ReactNode }
> = {
  OPEN: {
    label: 'OPEN',
    bg: '#FEF08A',
    icon: <Clock size={12} color="#000" />,
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    bg: '#DBEAFE',
    icon: <AlertCircle size={12} color="#000" />,
  },
  RESOLVED: {
    label: 'RESOLVED',
    bg: '#D1FAE5',
    icon: <CheckCircle2 size={12} color="#000" />,
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── FAQ Item Component ────────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen((v) => !v)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        {open ? (
          <ChevronUp size={18} color="#000" />
        ) : (
          <ChevronDown size={18} color="#000" />
        )}
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

// ─── Ticket Card Component ─────────────────────────────────────────────────────
function TicketCard({
  ticket,
  onPress,
}: {
  ticket: SupportTicket;
  onPress: () => void;
}) {
  const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.OPEN;
  return (
    <TouchableOpacity style={styles.ticketCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.ticketCardHeader}>
        <Text style={styles.ticketSubject} numberOfLines={1}>
          {ticket.subject}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          {cfg.icon}
          <Text style={styles.statusText}>{cfg.label}</Text>
        </View>
      </View>

      <Text style={styles.ticketDescription} numberOfLines={2}>
        {ticket.description}
      </Text>

      <View style={styles.ticketMeta}>
        <Text style={styles.ticketMetaLabel}>VET</Text>
        <Text style={styles.ticketMetaValue}>
          {ticket.assignedVet
            ? `${ticket.assignedVet.firstName} ${ticket.assignedVet.lastName}`
            : 'Unassigned'}
        </Text>
      </View>

      <View style={styles.ticketFooter}>
        <Text style={styles.ticketDate}>{formatDate(ticket.createdAt)}</Text>
        <ChevronRight size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Ticket Detail Modal ───────────────────────────────────────────────────────
function TicketDetailModal({
  ticket,
  visible,
  onClose,
}: {
  ticket: SupportTicket | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!ticket) return null;
  const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.OPEN;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Handle bar */}
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>TICKET DETAILS</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <X size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status */}
            <View style={[styles.statusBadgeLg, { backgroundColor: cfg.bg }]}>
              {cfg.icon}
              <Text style={styles.statusTextLg}>{cfg.label}</Text>
            </View>

            {/* Subject */}
            <Text style={styles.detailSectionLabel}>SUBJECT</Text>
            <Text style={styles.detailValue}>{ticket.subject}</Text>

            {/* Description */}
            <Text style={[styles.detailSectionLabel, { marginTop: 16 }]}>DESCRIPTION</Text>
            <Text style={styles.detailValue}>{ticket.description}</Text>

            {/* Assigned Vet */}
            <Text style={[styles.detailSectionLabel, { marginTop: 16 }]}>ASSIGNED VET</Text>
            <Text style={styles.detailValue}>
              {ticket.assignedVet
                ? `${ticket.assignedVet.firstName} ${ticket.assignedVet.lastName}`
                : 'Unassigned'}
            </Text>
            {ticket.assignedVet && (
              <Text style={styles.detailSubValue}>{ticket.assignedVet.email}</Text>
            )}

            {/* Clinic */}
            {ticket.targetClinic && (
              <>
                <Text style={[styles.detailSectionLabel, { marginTop: 16 }]}>CLINIC</Text>
                <Text style={styles.detailValue}>{ticket.targetClinic.name}</Text>
              </>
            )}

            {/* Dates */}
            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailSectionLabel}>CREATED</Text>
                <Text style={styles.detailValue}>{formatDate(ticket.createdAt)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailSectionLabel}>UPDATED</Text>
                <Text style={styles.detailValue}>{formatDate(ticket.updatedAt)}</Text>
              </View>
            </View>

            {/* Ticket ID */}
            <Text style={[styles.detailSectionLabel, { marginTop: 16 }]}>TICKET ID</Text>
            <Text style={[styles.detailValue, { fontSize: 11 }]} numberOfLines={1}>
              {ticket.id}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function HelpSupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { tickets, loading: ticketsLoading, createTicket } = useTickets();

  // Clinics
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [clinicDropdownOpen, setClinicDropdownOpen] = useState(false);

  // Members (owner + staff) for selected clinic
  const [members, setMembers] = useState<ClinicMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Detail modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load clinics on mount
  useEffect(() => {
    api
      .getClinics()
      .then(setClinics)
      .catch(() => setClinics([]))
      .finally(() => setClinicsLoading(false));
  }, []);

  // Load clinic details (owner + staff) when clinic changes
  useEffect(() => {
    if (!selectedClinicId) {
      setMembers([]);
      setSelectedMemberId('');
      return;
    }
    setMembersLoading(true);
    setMembers([]);
    setSelectedMemberId('');
    api
      .getClinicDetails(selectedClinicId)
      .then((details) => {
        const list: ClinicMember[] = [];
        if (details.owner) {
          list.push({
            id: details.owner.id,
            firstName: details.owner.firstName,
            lastName: details.owner.lastName,
            email: details.owner.email,
            role: details.owner.role,
            isOwner: true,
          });
        }
        if (Array.isArray(details.staff)) {
          details.staff.forEach((s: any) => {
            const u = s.user ?? s;
            if (u && u.id && u.id !== details.owner?.id) {
              list.push({
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                role: u.role,
                isOwner: false,
              });
            }
          });
        }
        setMembers(list);
      })
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [selectedClinicId]);

  const selectedClinic = clinics.find((c) => c.id === selectedClinicId);
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Missing Info', 'Please enter a subject.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Info', 'Please enter a description.');
      return;
    }
    if (!selectedClinicId) {
      Alert.alert('Missing Info', 'Please select a clinic first.');
      return;
    }
    if (!selectedMemberId) {
      Alert.alert('Missing Info', 'Please select a vet / staff member to assign this ticket to.');
      return;
    }

    setSubmitting(true);
    const payload: any = {
      subject: subject.trim(),
      description: description.trim(),
      assignedVetId: selectedMemberId,
      targetClinicId: selectedClinicId,
    };

    const { error } = await createTicket(payload);
    setSubmitting(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      setSubject('');
      setDescription('');
      setSelectedClinicId('');
      setSelectedMemberId('');
      Alert.alert('Success', 'Your ticket has been submitted!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HELP & SUPPORT</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── FAQ Section ─────────────────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconCircle}>
            <HelpCircle size={18} color="#000" />
          </View>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        </View>

        <View style={styles.card}>
          {FAQ_ITEMS.map((item, idx) => (
            <React.Fragment key={idx}>
              <FaqItem question={item.question} answer={item.answer} />
              {idx < FAQ_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Create Ticket Section ────────────────────────────────── */}
        <View style={[styles.sectionHeaderRow, { marginTop: 32 }]}>
          <View style={[styles.sectionIconCircle, { backgroundColor: '#DBEAFE' }]}>
            <MessageSquarePlus size={18} color="#000" />
          </View>
          <Text style={styles.sectionTitle}>CREATE SUPPORT TICKET</Text>
        </View>

        <View style={styles.card}>
          {/* Subject */}
          <Text style={styles.inputLabel}>SUBJECT</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief summary of your issue"
            placeholderTextColor="#999"
            value={subject}
            onChangeText={setSubject}
            maxLength={120}
          />

          {/* Description */}
          <Text style={[styles.inputLabel, { marginTop: 16 }]}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your issue in detail..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* ── Step 1: Clinic Selector ───────────────────────── */}
          <Text style={[styles.inputLabel, { marginTop: 16 }]}>SELECT CLINIC</Text>
          {clinicsLoading ? (
            <View style={styles.vetLoadingRow}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.vetLoadingText}>Loading clinics...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => {
                  setClinicDropdownOpen((v) => !v);
                  setMemberDropdownOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownBtnText, !selectedClinic && { color: '#999' }]}>
                  {selectedClinic ? selectedClinic.name : 'Select a clinic...'}
                </Text>
                {clinicDropdownOpen ? (
                  <ChevronUp size={18} color="#000" />
                ) : (
                  <ChevronDown size={18} color="#000" />
                )}
              </TouchableOpacity>

              {clinicDropdownOpen && (
                <View style={styles.dropdownList}>
                  {clinics.length === 0 ? (
                    <Text style={styles.dropdownEmpty}>No clinics available</Text>
                  ) : (
                    clinics.map((clinic) => (
                      <TouchableOpacity
                        key={clinic.id}
                        style={[
                          styles.dropdownOption,
                          selectedClinicId === clinic.id && styles.dropdownOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedClinicId(clinic.id);
                          setClinicDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionName}>{clinic.name}</Text>
                        <Text style={styles.dropdownOptionClinic}>{clinic.address}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </>
          )}

          {/* ── Step 2: Owner / Staff Selector ───────────────── */}
          {selectedClinicId ? (
            <>
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>ASSIGN TO VET / STAFF</Text>
              {membersLoading ? (
                <View style={styles.vetLoadingRow}>
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={styles.vetLoadingText}>Loading members...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() => {
                      setMemberDropdownOpen((v) => !v);
                      setClinicDropdownOpen(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dropdownBtnText, !selectedMember && { color: '#999' }]}>
                      {selectedMember
                        ? `${selectedMember.firstName} ${selectedMember.lastName}${selectedMember.isOwner ? ' (Owner)' : ' (Staff)'}`
                        : 'Select a vet / staff member...'}
                    </Text>
                    {memberDropdownOpen ? (
                      <ChevronUp size={18} color="#000" />
                    ) : (
                      <ChevronDown size={18} color="#000" />
                    )}
                  </TouchableOpacity>

                  {memberDropdownOpen && (
                    <View style={styles.dropdownList}>
                      {members.length === 0 ? (
                        <Text style={styles.dropdownEmpty}>No members found for this clinic</Text>
                      ) : (
                        members.map((member) => (
                          <TouchableOpacity
                            key={member.id}
                            style={[
                              styles.dropdownOption,
                              selectedMemberId === member.id && styles.dropdownOptionSelected,
                            ]}
                            onPress={() => {
                              setSelectedMemberId(member.id);
                              setMemberDropdownOpen(false);
                            }}
                          >
                            <View style={styles.memberRow}>
                              <Text style={styles.dropdownOptionName}>
                                {member.firstName} {member.lastName}
                              </Text>
                              <View
                                style={[
                                  styles.memberBadge,
                                  member.isOwner
                                    ? styles.memberBadgeOwner
                                    : styles.memberBadgeStaff,
                                ]}
                              >
                                <Text style={styles.memberBadgeText}>
                                  {member.isOwner ? 'OWNER' : 'STAFF'}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.dropdownOptionClinic}>{member.email}</Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </>
              )}
            </>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>SUBMIT TICKET</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── My Tickets Section ───────────────────────────────────── */}
        {(ticketsLoading || tickets.length > 0) && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 32, marginBottom: 16 }]}>
              MY TICKETS
            </Text>

            {ticketsLoading ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.loaderText}>Loading tickets...</Text>
              </View>
            ) : (
              tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onPress={() => {
                    setSelectedTicket(ticket);
                    setModalVisible(true);
                  }}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedTicket(null);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: 1 },

  // Content
  content: { padding: 20, paddingBottom: 50 },

  // Section headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF08A',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },

  // FAQ
  faqItem: { paddingVertical: 4 },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    lineHeight: 20,
    paddingBottom: 8,
  },
  divider: { height: 2, backgroundColor: '#000', opacity: 0.08, marginVertical: 4 },

  // Form inputs
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    backgroundColor: '#FAF9F6',
  },
  textArea: { height: 100 },

  // Dropdowns (clinic + member)
  vetLoadingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  vetLoadingText: { marginLeft: 10, fontWeight: '700', color: '#666' },
  dropdownBtn: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
  },
  dropdownBtnText: { fontSize: 15, fontWeight: '700', color: '#000', flex: 1 },
  dropdownList: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  dropdownEmpty: {
    padding: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },
  dropdownOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownOptionSelected: { backgroundColor: '#FEF08A' },
  dropdownOptionName: { fontSize: 14, fontWeight: '800', color: '#000' },
  dropdownOptionClinic: { fontSize: 12, fontWeight: '600', color: '#666', marginTop: 2 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberBadge: {
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  memberBadgeOwner: { backgroundColor: '#FEF08A' },
  memberBadgeStaff: { backgroundColor: '#DBEAFE' },
  memberBadgeText: { fontSize: 9, fontWeight: '900', color: '#000', textTransform: 'uppercase' },

  // Submit button
  submitBtn: {
    marginTop: 20,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Ticket card
  ticketCard: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  ticketSubject: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: '900', color: '#000', textTransform: 'uppercase' },
  ticketDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    lineHeight: 18,
    marginBottom: 10,
  },
  ticketMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 10 },
  ticketMetaLabel: { fontSize: 10, fontWeight: '900', color: '#888', textTransform: 'uppercase' },
  ticketMetaValue: { fontSize: 13, fontWeight: '800', color: '#000' },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  ticketDate: { fontSize: 12, fontWeight: '700', color: '#888' },

  // Loader row
  loaderRow: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  loaderText: { marginLeft: 10, fontWeight: '700', color: '#666' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000',
    padding: 24,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#000',
    opacity: 0.2,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#000', letterSpacing: 1 },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeLg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  statusTextLg: { fontSize: 13, fontWeight: '900', color: '#000', textTransform: 'uppercase' },
  detailSectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: { fontSize: 16, fontWeight: '800', color: '#000' },
  detailSubValue: { fontSize: 13, fontWeight: '600', color: '#666', marginTop: 2 },
  dateRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
});
