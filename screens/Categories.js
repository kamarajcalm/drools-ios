import React, { Component } from 'react';
import { View, Text, TextInput, Dimensions, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Alert,} from 'react-native';
const { height, width } = Dimensions.get('window')
import settings from '../AppSettings'
const gradients = settings.gradients
const primaryColor = settings.primaryColor
const secondaryColor = settings.secondaryColor
const fontFamily = settings.fontFamily
const themeColor = settings.themeColor
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import HttpsClient from '../HttpsClient';
const url =settings.url
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons, Entypo, Fontisto, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Modal from 'react-native-modal';
const screenHeight =Dimensions.get("screen").height
export default class Categories extends Component {
  constructor(props) {
    super(props);
    this.state = {
        Items:[],
        categoryName:"",
        refreshing:false,
        modal:false,
        title:"",
        selectedItem:null
    };
  }
    showSimpleMessage(content, color, type = "info", props = {}) {
        const message = {
            message: content,
            backgroundColor: color,
            icon: { icon: "auto", position: "left" },
            type,
            ...props,
        };

        showMessage(message);
    }
    addCategory = async()=>{
        if (this.state.categoryName == "") {
            return this.showSimpleMessage("Please add Name", "#dd7030",)
        }
        let api =`${url}/api/drools/category/`
        let sendData ={
            title: this.state.categoryName
        }
      let post =await HttpsClient.post(api,sendData)
      if(post.type =="success"){
          this.setState({ categoryName:""})
          this.getCategories()
         return this.showSimpleMessage("Added SuccessFully", "#00A300", "success")
      }else{
          return this.showSimpleMessage("Try again", "#dd7030",)
      }

    }
    header =()=>{
        return(
            <View style={{ flexDirection: "row" ,paddingVertical:10,flex:1}}>
                <View style={{flex:0.5,alignItems:"center",justifyContent:"center"}}>
                    <View>
                        <Text style={[styles.text, { textDecorationLine: "underline", color: "#000" }]}>Item</Text>
                    </View>
                </View>
              <View style={{flex:0.25,alignItems:"center",justifyContent:"center"}}>
                    <View>
                        <Text style={[styles.text, { textDecorationLine: "underline", color: "#000" }]}>Action</Text>
                    </View>
              </View>
                <View style={{ flex: 0.25, alignItems: "center", justifyContent: "center" }}>
                    <View>
                        <Text style={[styles.text, { textDecorationLine: "underline", color: "#000" }]}></Text>
                    </View>
                </View>
            </View>
        )
 
    }
    
    getCategories =async()=>{
        this.setState({ refreshing: true})
        let api = `${url}/api/drools/category/`
        const data = await HttpsClient.get(api)
       if(data.type =="success"){
           this.setState({ Items: data.data, refreshing:false})
       }else{
           this.setState({ refreshing: false })
       }
    }
    componentDidMount(){
        this.getCategories();
    }
    deleteItem = async (item, index) => {
        let duplicate = this.state.Items
        let api = `${url}/api/drools/category/${item.id}/`
        let del = await HttpsClient.delete(api)
        if (del.type == "success") {
            duplicate.splice(index, 1)
            this.setState({ Items: duplicate })
            return this.showSimpleMessage("deleted SuccessFully", "#00A300", "success")
        } else {
            return this.showSimpleMessage("try again ", "red", "danger")
        }
    }
    createAlert = (item, index) => {
        Alert.alert(
            "Do you want to delete?",
            ``,
            [
                {
                    text: "No",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "Yes", onPress: () => { this.deleteItem(item, index) } }
            ]
        );
    }
    edit = async ()=>{
         this.setState({editing:true})
        let api = `${url}/api/drools/category/${this.state.selectedItem.id}/`
        let sendData ={
            title:this.state.title
        }
        let patch =  await HttpsClient.patch(api,sendData)
        if(patch.type=="success"){
            this.setState({ editing:false,modal:false})
            this.showSimpleMessage("edited SuccessFully","green","success")
            this.getCategories()
        }else{
            this.setState({ editing: false,})
            this.showSimpleMessage("Try Again", "red", "danger")
        }
    }
    modal =()=>{
        return(
            <Modal
              deviceHeight={screenHeight}
              isVisible={this.state.modal}
              onBackdropPress={()=>{this.setState({modal:false})}}
            >
              <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
                    <View style={{height:height*0.3,width:width*0.9,borderRadius:10,backgroundColor:"#fff",alignItems:"center",justifyContent:"center"}}>
                             <View style={{alignItems:"center",justifyContent:"center",marginVertical:10}}>
                                 <Text style={[styles.text,{color:"#000",fontSize:20}]}>Edit Category :</Text>
                             </View>
                             <View style={{paddingLeft:10}}>
                                 <Text style={[styles.text,{color:"#000",fontSize:18}]}>Enter Title :</Text>
                                 <TextInput
                                   value={this.state.title}
                                   onChangeText={(title)=>{this.setState({title})}}
                                   selectionColor={themeColor}
                                   style={{height:35,width:width*0.8,backgroundColor:"#fafafa",paddingLeft:5,marginTop:10}}
                                 
                                 />
                             </View>
                             <View style={{marginTop:20}}>
                                 <TouchableOpacity style={{height:height*0.05,width:width*0.4,alignItems:"center",justifyContent:"center",backgroundColor:primaryColor}}
                                  onPress={()=>{this.edit()}}
                                 >
                                    {this.state.editing?<ActivityIndicator color={"#fff"} size={"large"}/> :<Text style={[styles.text,{color:"#fff"}]}>Save</Text>}
                                 </TouchableOpacity>
                             </View>
                    </View>
              </View>
            </Modal>
        )
    }
  render() {
    return (
      <View style={{flex:1}}>
            <View style={{ height: height * 0.08, flexDirection: 'row', backgroundColor: "#fff", alignItems: "center", justifyContent: "space-around" }}>
                <View>
                    <TextInput
                        value={this.state.categoryName}
                        style={{ height: 38, width: width * 0.6, backgroundColor: "#fafafa", borderRadius: 10 }}
                        placeholder={"Enter category"}
                        selectionColor={themeColor}
                        onChangeText={(categoryName) => { this.setState({ categoryName }) }}
                    />
                </View>
                <View>
                    <TouchableOpacity style={{ height: height * 0.05, width: width * 0.3, alignItems: "center", justifyContent: "center", backgroundColor: themeColor, borderRadius: 10 }}
                        onPress={() => { this.addCategory() }}
                    >
                        {this.state.creating ? <ActivityIndicator size={"small"} color={"#fff"} /> : <Text style={[styles.text, { color: "#fff" }]}>Add</Text>}
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList 
              refreshing={this.state.refreshing}
              onRefresh={()=>{this.getCategories()}}
              data={this.state.Items}
              keyExtractor={(item,index)=>index.toString()}
              ListHeaderComponent={this.header()}
              renderItem ={({item,index})=>{
                return(
                    <View style={{ flexDirection: "row", paddingVertical: 10,}}>
                        <View style={{flex:0.5,alignItems:"center",justifyContent:"center"}}>
                            <View>
                                <Text style={[styles.text, { color: "#000" }]}>{index + 1}. {item.title}</Text>
                            </View>
                        </View>
                        <View style={{flex:0.25,alignItems:"center",justifyContent:"center"}}>
                            <TouchableOpacity 
                                onPress={() => { this.props.navigation.navigate('ViewCategories',{item})}}
                            
                            >
                                <Text style={[styles.text, { textDecorationLine: "underline", color: "#000" }]}>View</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 0.25, alignItems: "center", justifyContent:"space-around",flexDirection:"row"}}>
                            <TouchableOpacity 
                             onPress ={()=>{this.createAlert(item,index)}}
                            >
                                <Entypo name="circle-with-cross" size={24} color="red" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { this.setState({ modal: true, title: item.title,selectedItem:item})}}
                            >
                                <Entypo name="edit" size={24} color="orange" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )
              }}
            />
            {
                this.modal()
            }
      </View>
    );
  }
}

const styles =StyleSheet.create({
  text:{
      fontFamily
  }
})