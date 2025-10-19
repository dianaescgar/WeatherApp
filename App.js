import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, ImageBackground, TextInput} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ScreenOrientation from 'expo-screen-orientation';

const SearchBar = (props) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <Ionicons name="search" size={27} color={isFocused ? '#3B67AA' : 'white'} style={styles.searchIcon} />
      <TextInput
        value={props.city}
        onChangeText={(text) => {
          props.setCity(text);
        }}
        onSubmitEditing={() => props.getWeather()}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.searchBar,
          isFocused && styles.inputFocused,
        ]}
      />
    </View>
  )
}

const MainTemp = (props) => {
  return (
    <View style={styles.mainTempContainer}>
      <Text style={styles.mainTemp}> {(props.temp).toFixed()}°C </Text>
    </View>
  );
};

const Description = (props) => {
  return (
    <View style={[styles.shadowBase, { width: 197, height: 39, top: 150, left: 40, position: 'absolute' }]}>
      <BlurView intensity={8} style={[styles.blurContainer, {borderRadius: 30}]}>
        <Text style={styles.description}>{props.description}</Text>
      </BlurView>
    </View>
  );
}

const Icon = (props) => {
  const iconUrl = `https://openweathermap.org/img/wn/${props.icon}@2x.png`;

  return (
    <View style={[styles.shadowBase, { width: 80, height: 80, top: 220, left: 40, position: 'absolute' }]}>
      <BlurView intensity={8} style={[styles.blurContainer, {borderRadius: 100}]}>
        <Image source={{ uri: iconUrl }} style={styles.icon} />
      </BlurView>
    </View>
  );
}

const WindHumidity = (props) => {
  return (
    <View style={styles.windHumidityContainer}>
      <View style={styles.windHumidityElement}>
        <Text style={styles.dataHeader}>Wind Speed</Text>
        <Text style={styles.windHumidity}>{props.windspeed} m/s</Text>
      </View>
      <View style={styles.windHumidityElement}>
        <Text style={styles.dataHeader}>Humidity</Text>
        <Text style={styles.windHumidity}>{props.humidity}%</Text>
      </View>
    </View>
  );
}

const Cell = (props) => {
  const iconUrl = `https://openweathermap.org/img/wn/${props.icon}@2x.png`;

  return (
    <View style={styles.cell}>
      <View style={{flexDirection: 'row', alignItems: 'center',}}>
        <Text style={styles.cellDate}>{props.day}</Text>

        <Image source={{ uri: iconUrl }} style={styles.cellIcon} />

        <View style={styles.hourDescSection}>
          <Text style={styles.cellHour}>{props.time}</Text>
          <Text style={styles.cellDescription}>{props.description}</Text>
        </View>
      </View>

      <Text style={styles.cellTemp}> {(props.temp).toFixed()}°C</Text>
    </View>
  );
}

export default function App() {
  const[city, setCity] = useState('Hermosillo');
  const[weather, setWeather] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);


  const getWeather = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=6d5112985289cc03aeebef7b464c1019&units=metric`);
      const json = await response.json();
      
      if (json.cod === "200") {
        setWeather(json.list);
      } else {
        setWeather([]);
      }
    } catch (error) {
      console.log(error);
      setWeather([]);
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
  if (city.trim().length < 2) {
    setWeather([]);
    setLoading(false);
    return;
  }
  const timer = setTimeout(() => {
    getWeather();
  }, 1000);
  return () => clearTimeout(timer);
}, [city]);

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require('./assets/FondoClima.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <SearchBar city={city} setCity={setCity} getWeather={getWeather} />
         
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A9DCFF" />
            </View>
          ) : weather.length > 0 ? (
            <>
              <MainTemp temp={weather[0].main.temp}/>
              <Description description={weather[0].weather[0].description}/>
              <Icon icon={weather[0].weather[0].icon}/>
              <WindHumidity
                windspeed={weather[0].wind.speed}
                humidity={weather[0].main.humidity}
              />
              <FlatList
                data={weather}
                keyExtractor={(item) => item.dt.toString()}
                renderItem={({ item }) => {
                  const date = new Date(item.dt_txt);
                  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                  const day = days[date.getDay()];
                  const hours = date.getHours().toString().padStart(2,"0");
                  const minutes = date.getMinutes().toString().padStart(2,"0");
                  const time = `${hours}:${minutes}`;

                  return (
                    <Cell
                      day={day}
                      time={time}
                      description={item.weather[0].description}
                      icon={item.weather[0].icon}
                      temp={item.main.temp}
                    />
                  );
                }}
              />
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={{color: 'white', fontSize: 12}}>
                Type a city name.
              </Text>
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    fontSize: 15,
    color: 'white',
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderColor: '#A9DCFF',
    borderWidth: 1,
    paddingLeft: 40,
  },
  inputFocused: {
    color: '#3B67AA',
    borderColor: 'white',
    borderWidth: 1.5,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    outlineStyle: 'none',
  },
  searchIcon: {
    left: 28,
    top: 35,
    zIndex: 2,
  },
  mainTempContainer: {
    width: 283,
    borderRadius: 30,
    backgroundColor: 'rgba(104, 109, 173, 0.15)',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    padding: 20,
    margin: 20,
    marginRight: 40,
    alignSelf: 'flex-end',
    borderColor: '#A9DCFF',
    borderWidth: 1,
    zIndex: 1,
  },
  mainTemp: {
    fontSize: 60,
    color: 'white',
    textAlign: 'center',
    top: 10,
    fontWeight: 'bold',
  },
  shadowBase: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    zIndex: 2,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(113, 172, 213,0.15)',
    borderColor: '#A9DCFF',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  description: {
    fontSize: 20,
    color: 'white',
  },
  icon: {
    width: 90,
    height: 90,
  },
  windHumidityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    margin: 15
  },
  windHumidityElement: {
    fontSize: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 164,
    height: 66,
    borderRadius: 30,
    backgroundColor: 'rgba(113, 172, 213,0.15)',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    borderColor: '#A9DCFF',
    borderWidth: 1,
    zIndex: 2,
  },
  dataHeader: {
    fontSize: 20,
    color: 'white',
    paddingTop: 8,
  },
  windHumidity: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  cell: {
    flexDirection: 'row',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderColor: 'white',
    borderWidth: 1,
    gap: 5,
  },
  cellDate: {
    color: '#5B7C93',
    fontSize: 17,
    width: 110,
    paddingLeft: 10,
  },
  cellIcon: {
    width: 50,
    height: 50,
  },
  hourDescSection: {
    width: 70,
  },
  cellHour: {
    color: '#5B7C93',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cellDescription: {
    color: '#5B7C93',
    fontSize: 12,
    width: 'auto',
  },
  cellTemp: {
    width: 80,
    color: '#5B7C93',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 30,
  },
});
