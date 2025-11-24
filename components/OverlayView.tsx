import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Component, ObjectData } from '../types';

interface OverlayViewProps {
    data: ObjectData;
    onComponentPress: (component: Component) => void;
}

export default function OverlayView({ data, onComponentPress }: OverlayViewProps) {
    return (
        <View style={styles.container} pointerEvents="box-none">
            {data.components.map((component) => (
                <TouchableOpacity
                    key={component.id}
                    style={[
                        styles.hotspot,
                        {
                            left: `${component.position.x}%`,
                            top: `${component.position.y}%`,
                        },
                    ]}
                    onPress={() => onComponentPress(component)}
                >
                    <View style={styles.dot} />
                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>{component.name}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    hotspot: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        marginLeft: -20, // Center the hotspot
        marginTop: -20,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 255, 255, 0.8)',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    labelContainer: {
        position: 'absolute',
        top: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 4,
    },
    labelText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
