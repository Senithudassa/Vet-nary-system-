import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePets, Pet } from '@/hooks/usePets';
import { useVetBook } from '@/hooks/useVetBook';
import { PawPrint, FileText } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function VetbookScreen() {
    const { pets, loading: petsLoading, refetch } = usePets();
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const { data: vetBook, loading: recordsLoading } = useVetBook(selectedPet?.id || null);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    useEffect(() => {
        if (pets.length > 0 && !selectedPet) {
            setSelectedPet(pets[0]);
        }
    }, [pets]);

    const records = vetBook?.records || [];

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
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.greeting}>DIGITAL VETBOOK</Text>
                    <Text style={styles.subtitle}>Medical History</Text>
                </View>

                {/* Pet Selector */}
                {pets.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                        {pets.map((pet: Pet) => (
                            <TouchableOpacity
                                key={pet.id}
                                style={[styles.petChip, selectedPet?.id === pet.id && styles.petChipActive]}
                                onPress={() => setSelectedPet(pet)}
                            >
                                <Text style={[styles.petChipText, selectedPet?.id === pet.id && styles.petChipTextActive]}>
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
                            Add your first pet to start tracking their health and medical history!
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
                                    {index !== records.length - 1 && <View style={styles.timelineLine} />}
                                </View>
                                <TouchableOpacity 
                                    style={[
                                        styles.recordCard, 
                                        { backgroundColor: record.type === 'VACCINATION' ? '#DBEAFE' : '#D1FAE5' }
                                    ]}
                                >
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordDate}>
                                            {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </Text>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusText}>COMPLETED</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.recordType}>
                                        {record.type === 'VACCINATION' ? record.vaccineName : record.diagnosis}
                                    </Text>
                                    <View style={styles.recordDetails}>
                                        <Text style={styles.detailText}>{record.type}</Text>
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
                            No medical records found for {selectedPet?.name || 'this pet'}.
                        </Text>
                    </View>
                ) : null}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAF9F6' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { marginBottom: 24, marginTop: 10 },
    greeting: { fontSize: 28, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
    subtitle: { fontSize: 16, fontWeight: '700', color: '#666', marginTop: 4 },
    petChip: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 3, borderColor: '#000', borderRadius: 20, marginRight: 8, backgroundColor: '#fff' },
    petChipActive: { backgroundColor: '#818CF8' },
    petChipText: { fontSize: 14, fontWeight: '900', color: '#000' },
    petChipTextActive: { color: '#fff' },
    sectionTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 16, letterSpacing: 0.5 },
    timelineContainer: { marginLeft: 8 },
    timelineRow: { flexDirection: 'row', marginBottom: 20 },
    timelineGraphic: { width: 30, alignItems: 'center', marginRight: 10 },
    timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#818CF8', borderWidth: 3, borderColor: '#000', zIndex: 2 },
    timelineLine: { width: 3, flex: 1, backgroundColor: '#000', marginTop: -2, marginBottom: -22, zIndex: 1 },
    recordCard: { flex: 1, borderWidth: 3, borderColor: '#000', borderRadius: 8, padding: 16, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
    recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    recordDate: { fontSize: 12, fontWeight: '800', color: '#000' },
    statusBadge: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '900', color: '#000', textTransform: 'uppercase' },
    recordType: { fontSize: 18, fontWeight: '900', color: '#000', marginBottom: 12 },
    recordDetails: { marginBottom: 4 },
    detailText: { fontSize: 14, fontWeight: '700', color: '#444' },
    loadingText: { marginTop: 10, fontSize: 16, fontWeight: '700', color: '#666' },
    recordsLoadingContainer: { padding: 40, alignItems: 'center' },
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
