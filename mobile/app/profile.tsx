import { useAuth } from '@/context/AuthContext';
import { usePets } from '@/hooks/usePets';
import { useRouter } from 'expo-router';
import { ArrowLeft, HelpCircle, LogOut, Mail, Phone, Shield, User } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { pets, loading: petsLoading } = usePets();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <User size={40} color="#000" />
          </View>
          <Text style={styles.nameText}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.statLabel}>Total Pets</Text>
            {petsLoading ? (
              <ActivityIndicator size="small" color="#000" style={{ marginTop: 8 }} />
            ) : (
              <Text style={styles.statValue}>{pets.length}</Text>
            )}
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statValue}>{user.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>CONTACT INFO</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Mail size={20} color="#000" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Phone size={20} color="#000" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Shield size={20} color="#000" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>ID</Text>
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                {user.id}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => router.push('/help-support' as any)}
        >
          <HelpCircle size={20} color="#000" style={{ marginRight: 8 }} />
          <Text style={styles.helpButtonText}>HELP & SUPPORT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: 1 },
  content: { padding: 20, paddingBottom: 40 },
  profileHeaderCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF08A',
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameText: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 4 },
  roleText: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#000', 
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  statLabel: { fontSize: 12, fontWeight: '800', color: '#444', textTransform: 'uppercase', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#000' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextWrapper: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#666', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#000' },
  divider: { height: 2, backgroundColor: '#000', opacity: 0.1, marginVertical: 16 },
  helpButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF08A',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  helpButtonText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
