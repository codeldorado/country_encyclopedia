import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useNavigation } from 'expo-router';
import axios from 'axios';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Favorite Countries',
      headerRight: () => (
        <Button mode="contained" onPress={() => router.push('/')} style={styles.headerButton}>
          Go to Home
        </Button>
      ),
    });
    loadFavoriteCountries();
  }, []);
  
  const loadFavoriteCountries = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favoriteCodes = JSON.parse(storedFavorites);
        fetchFavoriteCountries(favoriteCodes);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavoriteCountries = async (codes) => {
    try {
      const codeString = codes.join(',');
      const response = await axios.get(`https://restcountries.com/v3.1/alpha?codes=${codeString}`);
      setFavorites(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Countries</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.cca3}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => router.push(`/country/${item.cca3}`)}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Image size={50} source={{ uri: item.flags.png }} />
              <View style={styles.textContainer}>
                <Text style={styles.countryName}>{item.name.common}</Text>
                <Text style={styles.region}>{item.region}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerButton: {
    marginRight: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 15,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  region: {
    color: '#777',
  },
});
