import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api, Clinic } from '@/lib/api';
import { Building2 } from 'lucide-react-native';

const CLINIC_COLORS = ['#baffc9', '#ffb3ba', '#bae1ff', '#FEF08A', '#FCE7F3'];

export default function DiscoverScreen() {
    const [search, setSearch] = useState('');
    const [allClinics, setAllClinics] = useState<Clinic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await api.getClinics();
            setAllClinics(data);
        } catch (err: any) {
            console.error('Error fetching clinics:', err);
            setError(err.message || 'Failed to load clinics');
        } finally {
            setIsLoading(false);
        }
    };

    const clinics = allClinics.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* Fixed Header & Search */}
            <View style={styles.headerBlock}>
                <Text style={styles.headerTitle}>FIND A CLINIC</Text>
                <View style={styles.searchBar}>
                    <IconSymbol name="magnifyingglass" size={20} color="#000" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or location..."
                        placeholderTextColor="#666"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity style={[styles.filterChip, { backgroundColor: '#000' }]}><Text style={[styles.filterText, { color: '#fff' }]}>All</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}><Text style={styles.filterText}>Open Now</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}><Text style={styles.filterText}>Top Rated</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}><Text style={styles.filterText}>Emergency</Text></TouchableOpacity>
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionTitle}>NEARBY CLINICS</Text>

                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text style={styles.loadingText}>Loading clinics...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={fetchClinics}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : clinics.length === 0 ? (
                    <View style={styles.emptyStateCard}>
                        <View style={styles.emptyIconCircle}>
                            <Building2 size={32} color="#000" />
                        </View>
                        <Text style={styles.emptyTitle}>NO CLINICS FOUND</Text>
                        <Text style={styles.emptySubtitle}>
                            We couldn't find any clinics matching your search. Try a different name or location!
                        </Text>
                    </View>
                ) : (
                    <>
                        {clinics.map((clinic, index) => (
                            <TouchableOpacity key={clinic.id} style={[styles.clinicCard, { backgroundColor: CLINIC_COLORS[index % CLINIC_COLORS.length] }]}>
                                <View style={styles.clinicHeader}>
                                    <Text style={styles.clinicName}>{clinic.name}</Text>
                                </View>

                                <View style={styles.clinicDetailsRow}>
                                    <View style={styles.detailItem}>
                                        <IconSymbol name="location.fill" size={14} color="#000" />
                                        <Text style={styles.detailText}>{clinic.address}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <IconSymbol name="clock.fill" size={14} color="#000" />
                                        <Text style={styles.detailText}>{clinic.operatingHours}</Text>
                                    </View>
                                </View>

                                <View style={styles.clinicActions}>
                                    <TouchableOpacity style={styles.primaryActionBtn}>
                                        <Text style={styles.primaryActionText}>Book Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAF9F6' },
    headerBlock: {
        padding: 20, backgroundColor: '#fff', borderBottomWidth: 4, borderColor: '#000',
        zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#000', letterSpacing: -0.5, marginBottom: 16 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 3, borderColor: '#000',
        height: 50, paddingHorizontal: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 16, fontWeight: '800', color: '#000', height: '100%' },
    filterScroll: { flexDirection: 'row' },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', borderRadius: 20, marginRight: 8 },
    filterText: { fontSize: 12, fontWeight: '800', color: '#000' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 16, letterSpacing: 0.5 },
    clinicCard: {
        borderWidth: 4, borderColor: '#000', borderRadius: 12, padding: 16, marginBottom: 20,
        shadowColor: '#000', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
    },
    clinicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    clinicName: { flex: 1, fontSize: 20, fontWeight: '900', color: '#000', paddingRight: 8 },
    clinicDetailsRow: { flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
    detailItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', paddingHorizontal: 8, paddingVertical: 4 },
    detailText: { fontSize: 12, fontWeight: '800', color: '#000', marginLeft: 6 },
    clinicActions: { flexDirection: 'row', justifyContent: 'space-between' },
    primaryActionBtn: {
        flex: 1, backgroundColor: '#fff', borderWidth: 3, borderColor: '#000', paddingVertical: 12,
        alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
    },
    primaryActionText: { fontSize: 14, fontWeight: '900', color: '#000', textTransform: 'uppercase' },
    centerContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
    errorText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FF4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryBtn: {
        backgroundColor: '#000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: '#000',
    },
    retryText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    emptyStateCard: {
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
