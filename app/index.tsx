// index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Text, TextInput, Avatar, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useNavigation } from 'expo-router';

const ITEMS_PER_PAGE = 20;

export default function Home() {
  const [countries, setCountries] = useState([]);
  const [displayedCountries, setDisplayedCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    loadCachedCountries();
    navigation.setOptions({ title: 'Country Encyclopedia' });
  }, []);

  useEffect(() => {
    paginateCountries();
  }, [countries, searchTerm, currentPage]);

  const loadCachedCountries = async () => {
    const cachedData = await AsyncStorage.getItem('countriesData');
    if (cachedData) {
      setCountries(JSON.parse(cachedData));
      setLoading(false);
    } else {
      fetchCountries();
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
      const sortedCountries = response.data.sort((a, b) => 
        a.name.common.localeCompare(b.name.common)
      );
      setCountries(sortedCountries);
      await AsyncStorage.setItem('countriesData', JSON.stringify(sortedCountries));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const paginateCountries = () => {
    const filtered = countries.filter(country =>
      country.name.common.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(country.translations || {}).some(t => 
        t.common.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedCountries(filtered.slice(0, endIndex));
  };

  const loadMore = () => {
    if (displayedCountries.length < countries.length) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCountries().finally(() => setRefreshing(false));
  };

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Search country..."
        value={searchTerm}
        onChangeText={text => {
          setSearchTerm(text);
          setCurrentPage(1); // Reset to page 1 when search term changes
        }}
        style={styles.searchInput}
      />
      <FlatList
        data={displayedCountries}
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
        initialNumToRender={10}
        windowSize={5}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
  searchInput: {
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
