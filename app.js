import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";

const App = () => {
    const [myData, setMyData] = useState([]);

    // Exercise 1B: fetch runs once on first render
    useEffect(() => {
        const myurl = "https://onlinecardappwebservice.onrender.com/allcards";

        fetch(myurl)
            .then((response) => {
                return response.json();
            })
            .then((myJson) => {
                setMyData(myJson);
            });
    }, []); // empty dependency array = run once only

    const renderItem = ({ item, index }) => {
        return (
            <View>
                <Text>{item.title}</Text>
            </View>
        );
    };

    return (
        <FlatList
            data={myData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
        />
    );
};

export default App;
