import { usePrescriptions } from "@/hooks/usePrescriptions";
import { usePets } from "@/hooks/usePets";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Pill, PawPrint } from "lucide-react-native";
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

const PET_COLORS = [
  "#FEF08A",
  "#DBEAFE",
  "#D1FAE5",
  "#FCE7F3",
  "#FFEDD5",
  "#EDE9FE",
];

export default function MedicationsScreen() {
  const router = useRouter();
  const { pets, loading: petsLoading } = usePets();
  const { data, loading, refetch } = usePrescriptions(pets);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const isLoading = petsLoading || loading;
  const hasPrescriptions = data.some((d) => d.prescriptions.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEDICATIONS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loaderText}>Fetching prescriptions...</Text>
          </View>
        ) : !hasPrescriptions ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconCircle}>
              <Pill size={32} color="#000" />
            </View>
            <Text style={styles.emptyTitle}>NO PRESCRIPTIONS</Text>
            <Text style={styles.emptySubtitle}>
              No prescriptions have been assigned to your pets yet.
            </Text>
          </View>
        ) : (
          data.map(({ pet, prescriptions }, petIndex) => {
            if (prescriptions.length === 0) return null;
            const cardColor = PET_COLORS[petIndex % PET_COLORS.length];

            return (
              <View key={pet.id} style={styles.petSection}>
                {/* Pet Header */}
                <View style={[styles.petHeader, { backgroundColor: cardColor }]}>
                  <View style={styles.petHeaderLeft}>
                    <View style={styles.petIconCircle}>
                      <PawPrint size={18} color="#000" />
                    </View>
                    <View>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petBreed}>
                        {pet.species}
                        {pet.breed ? ` • ${pet.breed}` : ""}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {prescriptions.length}{" "}
                      {prescriptions.length === 1 ? "Rx" : "Rxs"}
                    </Text>
                  </View>
                </View>

                {/* Prescription Cards */}
                {prescriptions.map((rx, index) => (
                  <View key={rx.id} style={styles.rxCard}>
                    {/* Medicine Name Row */}
                    <View style={styles.rxTitleRow}>
                      <View style={styles.rxIconWrap}>
                        <Pill size={16} color="#000" />
                      </View>
                      <Text style={styles.medicineName}>{rx.medicineName}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Meta Grid */}
                    <View style={styles.metaGrid}>
                      {rx.dosage ? (
                        <View style={styles.metaItem}>
                          <Text style={styles.metaLabel}>DOSAGE</Text>
                          <Text style={styles.metaValue}>{rx.dosage}</Text>
                        </View>
                      ) : null}
                      {rx.frequency ? (
                        <View style={styles.metaItem}>
                          <Text style={styles.metaLabel}>FREQUENCY</Text>
                          <Text style={styles.metaValue}>{rx.frequency}</Text>
                        </View>
                      ) : null}
                      {rx.duration ? (
                        <View style={styles.metaItem}>
                          <Text style={styles.metaLabel}>DURATION</Text>
                          <Text style={styles.metaValue}>{rx.duration}</Text>
                        </View>
                      ) : null}
                      {rx.issuedAt ? (
                        <View style={styles.metaItem}>
                          <Text style={styles.metaLabel}>ISSUED</Text>
                          <Text style={styles.metaValue}>
                            {formatDate(rx.issuedAt)}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Vet & Clinic */}
                    {(rx.vet || rx.clinic) && (
                      <View style={styles.bottomRow}>
                        {rx.vet && (
                          <Text style={styles.vetText}>
                            Dr. {rx.vet.firstName} {rx.vet.lastName}
                          </Text>
                        )}
                        {rx.clinic && (
                          <Text style={styles.clinicText}>{rx.clinic.name}</Text>
                        )}
                      </View>
                    )}

                    {/* Notes */}
                    {rx.notes ? (
                      <View style={styles.notesBox}>
                        <Text style={styles.notesLabel}>NOTES</Text>
                        <Text style={styles.notesText}>{rx.notes}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            );
          })
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

  // Loader / Empty
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

  // Pet section
  petSection: { marginBottom: 28 },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 0,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  petHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  petIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  petName: { fontSize: 18, fontWeight: "900", color: "#000" },
  petBreed: { fontSize: 12, fontWeight: "700", color: "#444", marginTop: 2 },
  countBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: { fontSize: 12, fontWeight: "900", color: "#fff" },

  // Rx Card
  rxCard: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 20,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  rxTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  rxIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  medicineName: { fontSize: 20, fontWeight: "900", color: "#000", flex: 1 },
  divider: {
    height: 2,
    backgroundColor: "#000",
    opacity: 0.12,
    marginVertical: 14,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: { minWidth: "40%" },
  metaLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: { fontSize: 14, fontWeight: "800", color: "#000" },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  vetText: { fontSize: 13, fontWeight: "800", color: "#000" },
  clinicText: { fontSize: 12, fontWeight: "700", color: "#666" },
  notesBox: {
    backgroundColor: "#FEF9C3",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: { fontSize: 13, fontWeight: "700", color: "#000", lineHeight: 18 },
});
