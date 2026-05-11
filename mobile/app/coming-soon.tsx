import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Clock } from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ComingSoon() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>COMING SOON</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Clock size={64} color="#000" />
        </View>
        <Text style={styles.title}>COMING SOON</Text>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            This feature will be available soon.
          </Text>
        </View>
        <Text style={styles.subtitle}>
          We are working hard to bring you the Pharmacy feature. Stay tuned for
          updates!
        </Text>
      </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 100,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#D1FAE5",
    borderWidth: 4,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000",
    marginBottom: 24,
    letterSpacing: 2,
  },
  banner: {
    backgroundColor: "#FEF08A",
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    transform: [{ rotate: "-2deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
