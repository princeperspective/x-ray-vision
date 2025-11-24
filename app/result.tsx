import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import OverlayView from '../components/OverlayView';
import { identifyObject } from '../services/ObjectRecognitionService';
import { Component, ObjectData } from '../types';

export default function ResultScreen() {
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
    const [data, setData] = useState<ObjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (imageUri) {
            analyzeImage(imageUri);
        }
    }, [imageUri]);

    const analyzeImage = async (uri: string) => {
        setLoading(true);
        try {
            const result = await identifyObject(uri);
            setData(result);
        } catch (error) {
            console.error('Error identifying object:', error);
            Alert.alert('Error', 'Failed to identify object.');
        } finally {
            setLoading(false);
        }
    };

    const handleComponentPress = (component: Component) => {
        Alert.alert(component.name, component.description);
    };

    if (!imageUri) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No image provided.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
                {data && <OverlayView data={data} onComponentPress={handleComponentPress} />}
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#00ff00" />
                        <Text style={styles.loadingText}>Analyzing Object...</Text>
                    </View>
                )}
            </View>

            <ScrollView style={styles.detailsContainer}>
                {data ? (
                    <>
                        <Text style={styles.title}>{data.name}</Text>
                        <Text style={styles.description}>{data.description}</Text>
                        <Text style={styles.sectionTitle}>Components:</Text>
                        {data.components.map((comp) => (
                            <View key={comp.id} style={styles.componentItem}>
                                <Text style={styles.componentName}>• {comp.name}</Text>
                                <Text style={styles.componentDesc}>{comp.description}</Text>
                            </View>
                        ))}
                    </>
                ) : (
                    !loading && <Text style={styles.errorText}>Could not identify object.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    imageContainer: {
        flex: 2,
        backgroundColor: '#000',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#00ff00',
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailsContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#ccc',
        marginBottom: 20,
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    componentItem: {
        marginBottom: 12,
    },
    componentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00ffff',
    },
    componentDesc: {
        fontSize: 14,
        color: '#aaa',
        marginLeft: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});
