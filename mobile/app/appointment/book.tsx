import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Clock, PawPrint, Stethoscope } from "lucide-react-native";
import { api, Clinic } from "@/lib/api";
import { usePets } from "@/hooks/usePets";
import { CustomAlert } from "@/components/ui/custom-alert";

export default function AppointmentBookingScreen() {
  const { clinicId } = useLocalSearchParams<{ clinicId: string }>();
  const router = useRouter();
  const { pets, loading: petsLoading } = usePets();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [clinicLoading, setClinicLoading] = useState(true);
  const [clinicError, setClinicError] = useState("");

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [reason, setReason] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadClinic = async () => {
      if (!clinicId) {
        setClinicLoading(false);
        return;
      }

      setClinicLoading(true);
      setClinicError("");

      try {
        const clinics = await api.getClinics();
        const found = clinics.find((item) => item.id === clinicId);
        if (isMounted) {
          setClinic(found ?? null);
        }
      } catch (err: any) {
        if (isMounted) {
          setClinicError(err.message || "Failed to load clinic.");
        }
      } finally {
        if (isMounted) {
          setClinicLoading(false);
        }
      }
    };

    loadClinic();

    return () => {
      isMounted = false;
    };
  }, [clinicId]);

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId),
    [pets, selectedPetId],
  );

  const dateOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const today = new Date();

    for (let i = 0; i < 5; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const value = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
      options.push({ value, label });
    }

    return options;
  }, []);

  useEffect(() => {
    if (!dateOptions.length) return;

    const isSelectedInRange = dateOptions.some(
      (option) => option.value === selectedDate,
    );

    if (!isSelectedInRange) {
      setSelectedDate(dateOptions[0].value);
    }
  }, [dateOptions, selectedDate]);

  const timeOptions = useMemo(
    () => ["09:00", "10:30", "12:00", "14:00", "16:00", "18:00"],
    [],
  );

  const buildAppointmentDate = () => {
    if (!selectedDate || !selectedTime) return null;
    const combined = new Date(`${selectedDate}T${selectedTime}:00`);
    if (Number.isNaN(combined.getTime())) return null;
    return combined.toISOString();
  };

  const handleSubmit = async () => {
    if (!clinicId) {
      setError("Clinic not found. Please try again.");
      return;
    }

    if (!selectedPetId) {
      setError("Please select a pet.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time.");
      return;
    }

    const appointmentDate = buildAppointmentDate();
    if (!appointmentDate) {
      setError("Please choose a valid date and time.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await api.createAppointment({
        clinicId,
        petId: selectedPetId,
        date: appointmentDate,
        reason: reason.trim() || undefined,
      });
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to book appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>{"<"}</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>BOOK APPOINTMENT</Text>
              <Text style={styles.subtitle}>
                Select a pet and schedule a visit
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>CLINIC DETAILS</Text>
            {clinicLoading ? (
              <View style={styles.centerRow}>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.loadingText}>Loading clinic...</Text>
              </View>
            ) : clinicError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{clinicError}</Text>
              </View>
            ) : clinic ? (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <Stethoscope size={18} color="#000" />
                  </View>
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoTitle}>{clinic.name}</Text>
                    <Text style={styles.infoText}>{clinic.address}</Text>
                    <Text style={styles.infoText}>{clinic.operatingHours}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Clinic not available.</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>SELECT PET</Text>
            {petsLoading ? (
              <View style={styles.centerRow}>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.loadingText}>Loading pets...</Text>
              </View>
            ) : pets.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No pets found. Add a pet to continue.
                </Text>
              </View>
            ) : (
              <View style={styles.petGrid}>
                {pets.map((pet) => {
                  const isSelected = pet.id === selectedPetId;
                  return (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        styles.petChip,
                        isSelected && styles.petChipSelected,
                      ]}
                      onPress={() => setSelectedPetId(pet.id)}
                    >
                      <PawPrint size={16} color="#000" />
                      <Text style={styles.petChipText}>{pet.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {selectedPet ? (
              <View style={styles.selectedPetCard}>
                <Text style={styles.selectedPetLabel}>SELECTED PET</Text>
                <Text style={styles.selectedPetText}>
                  {selectedPet.name} • {selectedPet.species}
                  {selectedPet.breed ? ` • ${selectedPet.breed}` : ""}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>DATE & TIME</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DATE</Text>
              <View style={styles.chipRow}>
                {dateOptions.map((option) => {
                  const isSelected = option.value === selectedDate;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.selectionChip,
                        isSelected && styles.selectionChipSelected,
                      ]}
                      onPress={() => setSelectedDate(option.value)}
                    >
                      <Calendar size={14} color="#000" />
                      <Text style={styles.selectionChipText}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>TIME</Text>
              <View style={styles.chipRow}>
                {timeOptions.map((time) => {
                  const isSelected = time === selectedTime;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.selectionChip,
                        isSelected && styles.selectionChipSelected,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Clock size={14} color="#000" />
                      <Text style={styles.selectionChipText}>{time}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>REASON</Text>
            <Text style={styles.label}>OPTIONAL</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about the visit..."
              placeholderTextColor="#999"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting || petsLoading}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>CONFIRM BOOKING</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={showSuccess}
        title="Success"
        message="Your appointment has been booked!"
        onClose={() => {
          setShowSuccess(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    marginBottom: 20,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
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
  backText: { fontSize: 16, fontWeight: "900", color: "#000" },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, fontWeight: "700", color: "#666", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoColumn: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: "900", color: "#000" },
  infoText: { fontSize: 13, fontWeight: "700", color: "#333", marginTop: 4 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  centerRow: { flexDirection: "row", alignItems: "center" },
  loadingText: { marginLeft: 10, fontSize: 14, fontWeight: "700" },
  emptyBox: {
    borderWidth: 2,
    borderColor: "#000",
    padding: 12,
    backgroundColor: "#F3F4F6",
  },
  emptyText: { fontSize: 12, fontWeight: "700", color: "#333" },
  petGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  petChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#fff",
  },
  petChipSelected: {
    backgroundColor: "#FEF08A",
  },
  petChipText: { marginLeft: 6, fontSize: 12, fontWeight: "800" },
  selectedPetCard: {
    marginTop: 14,
    padding: 12,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#FCE7F3",
  },
  selectedPetLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  selectedPetText: { fontSize: 13, fontWeight: "800", color: "#000" },
  inputGroup: { marginBottom: 14 },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  selectionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#fff",
  },
  selectionChipSelected: {
    backgroundColor: "#DBEAFE",
  },
  selectionChipText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
  },
  input: {
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 6,
    backgroundColor: "#FAF9F6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 120,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#EF4444",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: { color: "#B91C1C", fontWeight: "700", fontSize: 14 },
  primaryButton: {
    backgroundColor: "#000",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
