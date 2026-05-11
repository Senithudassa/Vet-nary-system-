import { Pet, usePets } from "@/hooks/usePets";
import { useVetBook, MedicalRecord } from "@/hooks/useVetBook";
import { useFocusEffect } from "@react-navigation/native";
import { FileText, PawPrint, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VetbookScreen() {
  const { pets, loading: petsLoading, refetch } = usePets();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const { data: records = [], loading: recordsLoading, refetch: refetchRecords } = useVetBook(
    selectedPet?.id || null,
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchRecords();
    }, [refetch, refetchRecords]),
  );

  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]);
    }
  }, [pets]);

  if (petsLoading && pets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#818CF8" />
          <Text style={styles.loadingText}>Loading Pets...</Text>
        </View>
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
          <Text style={styles.greeting}>DIGITAL VETBOOK</Text>
          <Text style={styles.subtitle}>Medical History</Text>
        </View>

        {/* Pet Selector */}
        {pets.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
          >
            {pets.map((pet: Pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petChip,
                  selectedPet?.id === pet.id && styles.petChipActive,
                ]}
                onPress={() => setSelectedPet(pet)}
              >
                <Text
                  style={[
                    styles.petChipText,
                    selectedPet?.id === pet.id && styles.petChipTextActive,
                  ]}
                >
                  {pet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconCircle}>
              <PawPrint size={32} color="#000" />
            </View>
            <Text style={styles.emptyTitle}>NO PETS YET</Text>
            <Text style={styles.emptySubtitle}>
              Add your first pet to start tracking their health and medical
              history!
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>TIMELINE</Text>

        {recordsLoading ? (
          <View style={styles.recordsLoadingContainer}>
            <ActivityIndicator size="small" color="#818CF8" />
            <Text style={styles.loadingText}>Fetching Records...</Text>
          </View>
        ) : records.length > 0 ? (
          <View style={styles.timelineContainer}>
            {records.map((record, index) => (
              <View key={index} style={styles.timelineRow}>
                <View style={styles.timelineGraphic}>
                  <View style={styles.timelineDot} />
                  {index !== records.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.recordCard,
                    {
                      backgroundColor:
                        record.type === "VACCINE" ? "#DBEAFE" : "#D1FAE5",
                    },
                  ]}
                  onPress={() => setSelectedRecord(record)}
                >
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>
                      {new Date(record.recordDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                    <View style={styles.badgeContainer}>
                      <View style={[styles.typeBadge, record.type === "VACCINE" ? styles.typeBadgeVaccine : styles.typeBadgeMedical]}>
                        <Text style={styles.typeBadgeText}>{record.type}</Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>COMPLETED</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.recordType}>
                    {record.type === "VACCINE"
                      ? record.vaccineName
                      : record.diagnosis}
                  </Text>
                  <View style={styles.recordDetails}>
                    <Text style={styles.detailText}>
                      Clinic: {record.clinic?.name || "N/A"}
                    </Text>
                    <Text style={styles.detailText}>
                      Vet: {record.type === "VACCINE" 
                        ? `${record.administeredBy?.firstName || ""} ${record.administeredBy?.lastName || ""}`.trim() || "N/A"
                        : `${record.vet?.firstName || ""} ${record.vet?.lastName || ""}`.trim() || "N/A"}
                    </Text>
                    {record.type === "VACCINE" && record.nextDueDate && (
                      <Text style={styles.detailText}>
                        Next Due: {new Date(record.nextDueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    )}
                    {record.type === "MEDICAL" && record.treatment && (
                      <Text style={styles.detailText}>
                        Treatment: {record.treatment}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : pets.length > 0 ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconCircle}>
              <FileText size={32} color="#000" />
            </View>
            <Text style={styles.emptyTitle}>NO RECORDS</Text>
            <Text style={styles.emptySubtitle}>
              No medical records found for {selectedPet?.name || "this pet"}.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Record Details Modal */}
      <Modal
        visible={!!selectedRecord}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedRecord?.type === "VACCINE" ? "Vaccination Record" : "Medical Record"}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedRecord(null)}
                style={styles.closeButton}
              >
                <X color="#000" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRecord && (
                <View style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Record Details</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedRecord.recordDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>

                    {selectedRecord.type === "VACCINE" ? (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Vaccine Name</Text>
                          <Text style={styles.detailValue}>{selectedRecord.vaccineName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Batch Number</Text>
                          <Text style={styles.detailValue}>{selectedRecord.batchNumber || "N/A"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Next Due Date</Text>
                          <Text style={styles.detailValue}>
                            {selectedRecord.nextDueDate
                              ? new Date(selectedRecord.nextDueDate).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Administered By</Text>
                          <Text style={styles.detailValue}>
                            {`${selectedRecord.administeredBy?.firstName || ""} ${selectedRecord.administeredBy?.lastName || ""}`.trim() || "N/A"}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Diagnosis</Text>
                          <Text style={styles.detailValue}>{selectedRecord.diagnosis}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Treatment</Text>
                          <Text style={styles.detailValue}>{selectedRecord.treatment || "N/A"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Prescription</Text>
                          <Text style={styles.detailValue}>{selectedRecord.prescription || "N/A"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Notes</Text>
                          <Text style={styles.detailValue}>{selectedRecord.notes || "N/A"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Vet</Text>
                          <Text style={styles.detailValue}>
                            {`${selectedRecord.vet?.firstName || ""} ${selectedRecord.vet?.lastName || ""}`.trim() || "N/A"}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  {selectedRecord.clinic && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Clinic Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Name</Text>
                        <Text style={styles.detailValue}>{selectedRecord.clinic.name}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>{selectedRecord.clinic.address || "N/A"}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Phone</Text>
                        <Text style={styles.detailValue}>{selectedRecord.clinic.phone || "N/A"}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Hours</Text>
                        <Text style={styles.detailValue}>{selectedRecord.clinic.operatingHours || "N/A"}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 10 },
  greeting: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, fontWeight: "700", color: "#666", marginTop: 4 },
  petChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  petChipActive: { backgroundColor: "#818CF8" },
  petChipText: { fontSize: 14, fontWeight: "900", color: "#000" },
  petChipTextActive: { color: "#fff" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  timelineContainer: { marginLeft: 8 },
  timelineRow: { flexDirection: "row", marginBottom: 20 },
  timelineGraphic: { width: 30, alignItems: "center", marginRight: 10 },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#818CF8",
    borderWidth: 3,
    borderColor: "#000",
    zIndex: 2,
  },
  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: "#000",
    marginTop: -2,
    marginBottom: -22,
    zIndex: 1,
  },
  recordCard: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recordDate: { fontSize: 12, fontWeight: "800", color: "#000" },
  badgeContainer: {
    flexDirection: "row",
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
  },
  typeBadgeVaccine: {
    backgroundColor: "#93C5FD",
  },
  typeBadgeMedical: {
    backgroundColor: "#6EE7B7",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
  },
  statusBadge: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
  },
  recordType: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    marginBottom: 12,
  },
  recordDetails: { marginBottom: 4 },
  detailText: { fontSize: 14, fontWeight: "700", color: "#444", marginBottom: 4 },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#666",
  },
  recordsLoadingContainer: { padding: 40, alignItems: "center" },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
  },
  closeButton: {
    padding: 4,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 8,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 4,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
