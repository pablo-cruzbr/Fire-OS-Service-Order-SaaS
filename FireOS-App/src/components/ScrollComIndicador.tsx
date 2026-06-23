import { View, Animated } from "react-native";
import { useRef } from "react";
import { styles } from "./styles";

export const ScrollComIndicador = ({ children }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const CONTAINER_HEIGHT = 700;
  const INDICATOR_HEIGHT = 40;

  const translateY = scrollY.interpolate({
    inputRange: [0, 600],
    outputRange: [0, CONTAINER_HEIGHT - INDICATOR_HEIGHT],
    extrapolate: "clamp",
  });

  return (
    <View style={{ height: CONTAINER_HEIGHT }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {children}
      </Animated.ScrollView>

      <View style={styles.scrollBar}>
        <Animated.View
          style={[
            styles.scrollIndicator,
            { transform: [{ translateY }] },
          ]}
        />
      </View>
    </View>
  );
};
