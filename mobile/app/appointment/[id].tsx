import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  PawPrint,
  Stethoscope,
  ReceiptText,
  CreditCard,
} from "lucide-react-native";
import { useAppointments } from "@/hooks/useAppointments";
import { useInvoices } from "@/hooks/useInvoices";

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { appointments, loading: loadingAppointments } = useAppointments();
  const { invoices, loading: loadingInvoices } = useInvoices();

  const appointment = appointments.find((item) => item.id === id);
  const appointmentInvoices = invoices.filter((inv) => inv.appointmentId === id);

  const loading = loadingAppointments || loadingInvoices;

  const formatAppointmentDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatAppointmentTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "#DBEAFE";
      case "COMPLETED":
        return "#D1FAE5";
      case "CANCELLED":
        return "#FCE7F3";
      case "NO_SHOW":
        return "#FEE2E2";
      case "PENDING":
      default:
        return "#FEF08A";
    }
  };

  if (loading && !appointment) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[styles.loaderContainer, { justifyContent: "center" }]}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loaderText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconCircle}>
              <Calendar size={32} color="#000" />
            </View>
            <Text style={styles.emptyTitle}>APPOINTMENT NOT FOUND</Text>
            <Text style={styles.emptySubtitle}>
              The appointment you are looking for is unavailable right now.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#000" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>APPOINTMENT DETAILS</Text>
            <Text style={styles.subtitle}>
              Review visit and clinic information
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.detailDate}>
                {formatAppointmentDate(appointment.date)}
              </Text>
              <Text style={styles.detailTime}>
                {formatAppointmentTime(appointment.date)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(appointment.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {appointment.status.replace("_", " ")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={[styles.metaItem, { marginRight: 12 }]}>
              <Text style={styles.metaLabel}>PET</Text>
              <Text style={styles.metaValue}>
                {appointment.pet?.name ?? "Unknown"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>REASON</Text>
              <Text style={styles.metaValue}>
                {appointment.reason ?? "Not specified"}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>VET</Text>
              <Text style={styles.metaValue}>
                {appointment.vet
                  ? `${appointment.vet.firstName} ${appointment.vet.lastName}`
                  : "Not assigned"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>CLINIC DETAILS</Text>

        <View style={styles.clinicCard}>
          <Text style={styles.clinicName}>
            {appointment.clinic?.name ?? "Clinic"}
          </Text>
          <Text style={styles.clinicAddress}>
            {appointment.clinic?.address ?? "Address not set"}
          </Text>

          <View style={styles.divider} />

          <View style={styles.clinicRow}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color="#000" />
            </View>
            <Text style={styles.clinicInfoText}>
              {appointment.clinic?.address ?? "Address not set"}
            </Text>
          </View>

          <View style={styles.clinicRow}>
            <View style={styles.iconCircle}>
              <Phone size={18} color="#000" />
            </View>
            <Text style={styles.clinicInfoText}>
              {appointment.clinic?.phone ?? "Phone not set"}
            </Text>
          </View>

          <View style={styles.clinicRow}>
            <View style={styles.iconCircle}>
              <Stethoscope size={18} color="#000" />
            </View>
            <Text style={styles.clinicInfoText}>
              {appointment.clinic?.operatingHours ?? "Hours not set"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>VISIT SUMMARY</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.iconCircle}>
              <PawPrint size={18} color="#000" />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>PET DETAILS</Text>
              <Text style={styles.summaryValue}>
                {appointment.pet
                  ? `${appointment.pet.name} • ${appointment.pet.species}${appointment.pet.breed ? ` • ${appointment.pet.breed}` : ""}`
                  : "Pet details not available"}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.iconCircle}>
              <Calendar size={18} color="#000" />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>SCHEDULED</Text>
              <Text style={styles.summaryValue}>
                {formatAppointmentDate(appointment.date)} at{" "}
                {formatAppointmentTime(appointment.date)}
              </Text>
            </View>
          </View>
        </View>

        {appointmentInvoices.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>BILLING & INVOICES</Text>
            {appointmentInvoices.map((invoice) => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceHeaderLeft}>
                    <View style={styles.iconCircle}>
                      <ReceiptText size={18} color="#000" />
                    </View>
                    <Text style={styles.invoiceId}>
                      INV-{invoice.id.substring(0, 8).toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          invoice.status === "PAID" ? "#D1FAE5" : "#FEF08A",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>{invoice.status}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Issued On</Text>
                  <Text style={styles.invoiceValue}>
                    {formatAppointmentDate(invoice.issuedAt)}
                  </Text>
                </View>
                {invoice.paidAt && (
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceLabel}>Paid On</Text>
                    <Text style={styles.invoiceValue}>
                      {formatAppointmentDate(invoice.paidAt)}
                    </Text>
                  </View>
                )}

                <View style={styles.invoiceTotalRow}>
                  <Text style={styles.invoiceTotalLabel}>TOTAL AMOUNT</Text>
                  <Text style={styles.invoiceTotalValue}>
                    ${invoice.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    marginBottom: 24,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  titleHolder: {
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, fontWeight: "700", color: "#666", marginTop: 4 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailDate: { fontSize: 16, fontWeight: "900", color: "#000" },
  detailTime: { fontSize: 12, fontWeight: "800", color: "#444", marginTop: 4 },
  statusBadge: {
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
  },
  divider: {
    height: 2,
    backgroundColor: "#000",
    opacity: 0.2,
    marginVertical: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#444",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  metaValue: { fontSize: 14, fontWeight: "800", color: "#000" },
  clinicCard: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 6,
  },
  clinicAddress: { fontSize: 14, fontWeight: "700", color: "#444" },
  clinicRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  clinicInfoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginLeft: 10,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  summaryTextBlock: { marginLeft: 12, flex: 1 },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#444",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  summaryValue: { fontSize: 14, fontWeight: "800", color: "#000" },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: { padding: 40, alignItems: "center", flex: 1 },
  loaderText: { marginTop: 12, fontWeight: "700", color: "#666" },
  emptyStateCard: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  invoiceCard: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    marginLeft: 10,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  invoiceLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },
  invoiceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
  },
  invoiceTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#F3F4F6",
  },
  invoiceTotalLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000",
  },
  invoiceTotalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
  },
});
