import { useAppointments } from "@/hooks/useAppointments";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Calendar } from "lucide-react-native";
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

export default function AppointmentsScreen() {
  const {
    appointments,
    loading: appointmentsLoading,
    refetch,
  } = useAppointments();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ALL APPOINTMENTS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {appointmentsLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loaderText}>Fetching your appointments...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconCircle}>
              <Calendar size={32} color="#000" />
            </View>
            <Text style={styles.emptyTitle}>NO APPOINTMENTS</Text>
            <Text style={styles.emptySubtitle}>
              You haven't booked any appointments yet.
            </Text>
          </View>
        ) : (
          appointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() =>
                router.push(`/appointment/${appointment.id}` as any)
              }
            >
              <View style={styles.appointmentHeader}>
                <View>
                  <Text style={styles.appointmentDate}>
                    {formatAppointmentDate(appointment.date)}
                  </Text>
                  <Text style={styles.appointmentTime}>
                    {formatAppointmentTime(appointment.date)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.appointmentStatusBadge,
                    { backgroundColor: getStatusColor(appointment.status) },
                  ]}
                >
                  <Text style={styles.appointmentStatusText}>
                    {appointment.status.replace("_", " ")}
                  </Text>
                </View>
              </View>

              <Text style={styles.appointmentClinicName}>
                {appointment.clinic?.name ?? "Clinic"}
              </Text>
              <Text style={styles.appointmentClinicAddress}>
                {appointment.clinic?.address ?? "Address not set"}
              </Text>

              <View style={styles.divider} />

              <View style={styles.appointmentMetaRow}>
                <View style={[styles.appointmentMetaItem, { marginRight: 12 }]}>
                  <Text style={styles.appointmentMetaLabel}>PET</Text>
                  <Text style={styles.appointmentMetaValue}>
                    {appointment.pet?.name ?? "Unknown"}
                  </Text>
                </View>
                <View style={styles.appointmentMetaItem}>
                  <Text style={styles.appointmentMetaLabel}>REASON</Text>
                  <Text style={styles.appointmentMetaValue}>
                    {appointment.reason ?? "Not specified"}
                  </Text>
                </View>
              </View>

              {appointment.vet ? (
                <View style={styles.appointmentMetaRow}>
                  <View style={styles.appointmentMetaItem}>
                    <Text style={styles.appointmentMetaLabel}>VET</Text>
                    <Text style={styles.appointmentMetaValue}>
                      {appointment.vet.firstName} {appointment.vet.lastName}
                    </Text>
                  </View>
                </View>
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentDate: { fontSize: 14, fontWeight: "900", color: "#000" },
  appointmentTime: {
    fontSize: 12,
    fontWeight: "800",
    color: "#444",
    marginTop: 2,
  },
  appointmentStatusBadge: {
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentStatusText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
  },
  appointmentClinicName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
  },
  appointmentClinicAddress: {
    fontSize: 12,
    fontWeight: "700",
    color: "#444",
    marginBottom: 12,
  },
  divider: {
    height: 2,
    backgroundColor: "#000",
    opacity: 0.2,
    marginVertical: 16,
  },
  appointmentMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  appointmentMetaItem: { flex: 1 },
  appointmentMetaLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#444",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  appointmentMetaValue: { fontSize: 14, fontWeight: "800", color: "#000" },
  loaderContainer: { padding: 40, alignItems: "center" },
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
});
