import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },

  scrollBar: {
    position: "absolute",
    right: 6,
    top: 0,
    bottom: 12,
    width: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  scrollIndicator: {
    width: 10,
    height: 42,
    borderRadius: 21,
    margin: 40,
    backgroundColor: "#2563EB", 
    opacity: 0.85,
    elevation: 3, 
  },
});
