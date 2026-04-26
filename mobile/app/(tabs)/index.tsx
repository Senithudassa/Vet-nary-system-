import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/context/AuthContext";
import { Pet, usePets } from "@/hooks/usePets";
import { Calendar, Camera, PawPrint, Pill, User } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function PetDashboard() {
  const { user, signOut } = useAuth();
  const { pets, loading, addPet } = usePets();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [newPet, setNewPet] = React.useState({
    name: "",
    species: "",
    breed: "",
    gender: "",
    weight: "",
  });
  const [addingPet, setAddingPet] = React.useState(false);

  const firstName = user?.firstName?.toUpperCase() ?? "THERE";

  const handleAddPet = async () => {
    if (!newPet.name || !newPet.species) {
      Alert.alert("Error", "Name and Species are required");
      return;
    }
    setAddingPet(true);
    try {
      const { error } = await addPet({
        ...newPet,
        weight: newPet.weight ? parseFloat(newPet.weight) : undefined,
      });
      if (error) {
        Alert.alert("Error", error);
      } else {
        setModalVisible(false);
        setNewPet({ name: "", species: "", breed: "", gender: "", weight: "" });
      }
    } finally {
      setAddingPet(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>HELLO, {firstName}</Text>
            <Text style={styles.subtitle}>Your Digital Vet Book</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={signOut}>
            <User size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#FCE7F3" }]}
          >
            <Calendar size={24} color="#000" style={{ marginBottom: 8 }} />
            <Text style={styles.actionBtnText}>Book Visit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#FFEDD5" }]}
          >
            <Camera size={24} color="#000" style={{ marginBottom: 8 }} />
            <Text style={styles.actionBtnText}>Skin Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#D1FAE5" }]}
          >
            <Pill size={24} color="#000" style={{ marginBottom: 8 }} />
            <Text style={styles.actionBtnText}>Pharmacy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>MY PETS</Text>

        {loading && pets.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loaderText}>Fetching your pets...</Text>
          </View>
        ) : (
          <>
            {pets.length === 0 ? (
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
            ) : (
              pets.map((pet: Pet, index: number) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petCard,
                    { backgroundColor: PET_COLORS[index % PET_COLORS.length] },
                  ]}
                >
                  <View style={styles.petCardHeader}>
                    <View>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petBreed}>
                        {pet.species}
                        {pet.breed ? ` • ${pet.breed}` : ""}
                        {pet.gender ? ` • ${pet.gender}` : ""}
                      </Text>
                    </View>
                    <View style={styles.iconCircle}>
                      <PawPrint size={20} color="#000" />
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.petCardFooter}>
                    <View>
                      <Text style={styles.footerLabel}>Weight</Text>
                      <Text style={styles.footerValue}>
                        {pet.weight ? `${pet.weight} kg` : "Not set"}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.viewBookBtn}>
                      <Text style={styles.viewBookBtnText}>Open VetBook</Text>
                      <IconSymbol name="chevron.right" size={16} color="#000" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={styles.addPetBtn}
              onPress={() => setModalVisible(true)}
            >
              <IconSymbol
                name="plus"
                size={20}
                color="#000"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.addPetBtnText}>ADD NEW PET</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Add Pet Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>ADD NEW PET</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <IconSymbol name="xmark" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.field}>
                  <Text style={styles.label}>PET NAME *</Text>
                  <TextInput
                    style={styles.input}
                    value={newPet.name}
                    onChangeText={(text) =>
                      setNewPet({ ...newPet, name: text })
                    }
                    placeholder="Buddy"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>SPECIES *</Text>
                  <TextInput
                    style={styles.input}
                    value={newPet.species}
                    onChangeText={(text) =>
                      setNewPet({ ...newPet, species: text })
                    }
                    placeholder="Dog, Cat, etc."
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>BREED</Text>
                  <TextInput
                    style={styles.input}
                    value={newPet.breed}
                    onChangeText={(text) =>
                      setNewPet({ ...newPet, breed: text })
                    }
                    placeholder="Golden Retriever"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>GENDER</Text>
                    <TextInput
                      style={styles.input}
                      value={newPet.gender}
                      onChangeText={(text) =>
                        setNewPet({ ...newPet, gender: text })
                      }
                      placeholder="Male/Female"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>WEIGHT (KG)</Text>
                    <TextInput
                      style={styles.input}
                      value={newPet.weight}
                      onChangeText={(text) =>
                        setNewPet({ ...newPet, weight: text })
                      }
                      placeholder="15.5"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, addingPet && { opacity: 0.7 }]}
                  onPress={handleAddPet}
                  disabled={addingPet}
                >
                  {addingPet ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>SAVE PET</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, fontWeight: "700", color: "#666", marginTop: 4 },
  profileBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  actionBtn: {
    flex: 1,
    height: 100,
    marginHorizontal: 4,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  actionBtnText: { fontWeight: "800", fontSize: 14, color: "#000" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  petCard: {
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
  petCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petName: { fontSize: 28, fontWeight: "900", color: "#000" },
  petBreed: { fontSize: 14, fontWeight: "700", color: "#444", marginTop: 4 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 2,
    backgroundColor: "#000",
    opacity: 0.2,
    marginVertical: 16,
  },
  petCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#444",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  footerValue: { fontSize: 16, fontWeight: "900", color: "#000" },
  viewBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewBookBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
    marginRight: 4,
  },
  addPetBtn: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  addPetBtnText: { fontSize: 16, fontWeight: "900", color: "#000" },
  loaderContainer: { padding: 40, alignItems: "center" },
  loaderText: { marginTop: 12, fontWeight: "700", color: "#666" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 16,
    padding: 24,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 24, fontWeight: "900", color: "#000" },
  field: { marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    backgroundColor: "#FAF9F6",
  },
  row: { flexDirection: "row" },
  submitBtn: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
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
