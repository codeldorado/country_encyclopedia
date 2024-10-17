import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, Button, Card, Title, Paragraph } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';

export default function CountryDetails() {
  const { countryCode } = useLocalSearchParams();
  const [country, setCountry] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [neighbors, setNeighbors] = useState([]);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    fetchAllCountries();
    checkFavorite();
    navigation.setOptions({ title: 'Loading...' });

    const fetchCountryDetails = async () => {
      try {
        const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const countryData = response.data[0];
        setCountry(countryData);

        if (countryData) {
          navigation.setOptions({ title: countryData.name.common });
        }
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };

    fetchCountryDetails();
  }, [countryCode]);

  useEffect(() => {
    if (country && country.borders) {
      fetchNeighborDetails();
    }
  }, [country]);

  const fetchAllCountries = async () => {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
      setAllCountries(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNeighborDetails = async () => {
    try {
      const neighborCodes = country.borders.join(',');
      const response = await axios.get(`https://restcountries.com/v3.1/alpha?codes=${neighborCodes}`);
      setNeighbors(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const checkFavorite = async () => {
    const storedFavorites = await AsyncStorage.getItem('favorites');
    if (storedFavorites) {
      const favoriteList = JSON.parse(storedFavorites);
      setIsFavorite(favoriteList.includes(countryCode));
    }
  };

  const toggleFavorite = async () => {
    const storedFavorites = await AsyncStorage.getItem('favorites');
    let favoriteList = storedFavorites ? JSON.parse(storedFavorites) : [];

    if (isFavorite) {
      favoriteList = favoriteList.filter((fav) => fav !== countryCode);
    } else {
      favoriteList.push(countryCode);
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(favoriteList));
    setIsFavorite(!isFavorite);
  };

  const getCountryRank = () => {
    const sortedCountries = allCountries.sort((a, b) => b.population - a.population);
    return sortedCountries.findIndex(c => c.cca3 === countryCode) + 1;
  };

  const openWikipediaLink = (languageName) => {
    const formattedName = languageName.replace(/ /g, '_');
    const url = `https://en.wikipedia.org/wiki/${formattedName}`;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  if (!country || allCountries.length === 0) return <Text>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Cover 
          source={{ uri: country.flags?.png }} 
          style={styles.flag}
          resizeMode="contain"
        />
        <Card.Content>
          <Title style={styles.title}>{country.name.common}</Title>
          <Paragraph style={styles.subtitle}>{country.name.official}</Paragraph>
          <Paragraph>Code: {country.cca3}</Paragraph>
          <Paragraph>Population: {country.population.toLocaleString()}</Paragraph>
          <Paragraph>Area: {country.area.toLocaleString()} sq km</Paragraph>
          <Paragraph>Population Rank: {getCountryRank()}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Languages</Title>
          {country.languages && Object.keys(country.languages).length > 0 ? (
            <FlatList
              data={Object.entries(country.languages)}
              keyExtractor={([code]) => code}
              renderItem={({ item: [code, language] }) => (
                <TouchableOpacity onPress={() => openWikipediaLink(language)}>
                  <Text style={styles.link}>{language}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Paragraph>No languages available</Paragraph>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Neighboring Countries</Title>
          {neighbors && neighbors.length > 0 ? (
            <FlatList
              data={neighbors}
              keyExtractor={(neighbor) => neighbor.cca3}
              renderItem={({ item: neighbor }) => (
                <TouchableOpacity onPress={() => router.push(`/country/${neighbor.cca3}`)}>
                  <Text style={styles.link}>{neighbor.name.common}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Paragraph>No neighboring countries</Paragraph>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={toggleFavorite}
        style={styles.favoriteButton}
        icon={isFavorite ? 'heart' : 'heart-outline'}
      >
        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 15,
    borderRadius: 8,
    elevation: 3,
  },
  flag: {
    height: 150,
    width: '100%',
    aspectRatio: 2.5,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  link: {
    color: '#1e90ff',
    fontSize: 16,
    marginBottom: 5,
    textDecorationLine: 'underline',
  },
  favoriteButton: {
    marginTop: 20,
  },
});
