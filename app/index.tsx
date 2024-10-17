import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, TextInput, Avatar, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useNavigation  } from 'expo-router';

export default function Home() {
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    fetchCountries();
    loadFavorites();
    navigation.setOptions({
      title: 'Country Encyclopedia',
    });
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
      const sortedCountries = response.data.sort((a, b) => 
        a.name.common.localeCompare(b.name.common)
      );
      setCountries(sortedCountries);
    } catch (error) {
      console.error(error);
    }
  };

  const loadFavorites = async () => {
    const storedFavorites = await AsyncStorage.getItem('favorites');
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
  };

  const filteredCountries = countries.filter(country =>
    country.name.common.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Object.values(country.translations || {}).some(t => 
      t.common.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Search country..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredCountries}
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
        style={styles.countryList}
      />
      <Button
        mode="contained"
        style={styles.favoritesButton}
        onPress={() => router.push('/favorites')}
      >
        View Favorites
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    marginBottom: 20,
  },
  countryList: {
    flex: 1,
    marginBottom: 60, // Ensures the list doesn’t overlap with the button
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
  favoritesButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
