import React,{useContext,useEffect,useState} from 'react'
import { Dialog, TextField, Checkbox, Accordion, AccordionDetails, AccordionSummary, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import {Text, Box, Flex, Button} from 'rebass'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
// import FavoriteIcon from '@material-ui/icons/Favorite';
// import ShareIcon from '@material-ui/icons/Share';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { useRouteMatch } from 'react-router-dom';

import {FETCH_POSTS_QUERY} from '../../apis/EventAPI'
import {FETCH_ALL_EVENTS_QUERY} from '../../apis/ParserEventAPI';

import { useStore } from '../../context/store';

import { AuthContext } from '../../context/auth';
import ParserEvent from './ParserEvent'
import Event from './Event'
import DataCity from '../../content/City.json'

const WrapperEvent = styled(Box)`
width:100%;
min-height: 720px;


`
const WrapperFilterEvent = styled(Box)`
/* position: fixed; */
`
const WrapperBlock = styled(Box)`
/* overflow:hidden; */
`


const Block = ({children }) => (
      <Box>
      {children}
      </Box>
);

export default function EventsBlock(props){
      const {eventsWindow, handleEventsWindow,authUser} = props;
      const [typeValue, setTypeValue] = useState("");
      const [favorite, setFavorite] = useState();
      const [myFollowing, setMyFollowing] = useState();
      const [onlineEvents, setOnlineEvents] = useState();
      const [searchValue, setSearchValue] = useState();
      const [{geolocation}] = useStore();

      const [isOpen, setIsOpen] = useState(true);
      const {url} =useRouteMatch()
  
      function handleOpen(){
            setIsOpen(false);
            window.history.pushState('', '', `${url}`);
      };

      const onTypeChange = e => setTypeValue(e.target.value);
      const onSearchChange = e => setSearchValue(e.target.value);
      const variables = {
            skip:null,
            limit: 10,
          };
      const { data,fetchMore } = useQuery(FETCH_ALL_EVENTS_QUERY, {variables});

      const mergeData = data && data.getParserEvents.concat(data.getPosts)
      const {user} = useContext(AuthContext);
      const filteredEvents =  mergeData&&mergeData.filter(post => ( 
            (post.city === geolocation.city || post.city === "")&& //Добавить логику контент от страны  
            (!typeValue || post.typeOfEvent === typeValue) && 
           (!onlineEvents || post.isOnline === true)&&
            (!searchValue || post.nameOfEvent === searchValue) &&  //Доработать ввод 
            (!favorite || post.likes.find(user =>user.userId === favorite)) 
            &&(!myFollowing || post.userId === myFollowing) //Доработать сравнение. Не видит значения 
            ));
      function favoriteHandle(){
            favorite ? setFavorite(null): setFavorite(user.id )
      }
      function onlineHandle(){
            onlineEvents ? setOnlineEvents(null): setOnlineEvents(mergeData&&mergeData.map(post=>post.isOnline=== true) )
      }
      function myFollowingHandle(){
            myFollowing ? setMyFollowing(null): setMyFollowing(authUser&&authUser.getAuthUser.following.map(user=> user.user))
      }
      console.log(mergeData&&mergeData.map(post=>post.isOnline=== true))
      const showMore = () => {
          fetchMore({
            variables: { limit:mergeData.length+10 },
            updateQuery: (prevResult, { fetchMoreResult }) => {
                      console.log(fetchMoreResult)

                  if (!fetchMoreResult) return prevResult;
                  return {
                        ...prevResult, ...fetchMoreResult
                      };
            }
      });
      }
      return (
            <Dialog open={isOpen}  onClose={()=>handleOpen()} width={1} maxWidth="xl"  >
                  <WrapperBlock m={[3,4]} minWidth={[null,"650px"]} >
                        <Flex mb={4}>
                              <Text  fontWeight='bold'>Events</Text>
                        </Flex>
                        <Flex width={1} flexDirection={["column-reverse","row"]} >
                              <WrapperEvent mr={[0,5]}>
                              <EventsList events={filteredEvents} user={user} panTo={props.panTo} handleEventsWindow={handleEventsWindow} showMore={showMore}/>
                              </WrapperEvent>
                              <Box width={[1,1/3,1/3]} >
                              <FilterBlock
                                    typeValue={typeValue}
                                    onTypeChange={onTypeChange}
                                    searchValue={searchValue}
                                    onSearchChange={onSearchChange}
                                    favoriteHandle={favoriteHandle}
                                    myFollowingHandle={myFollowingHandle}
                                    onlineHandle={onlineHandle}
                                    />
                              </Box>
                        </Flex>
                  </WrapperBlock>
            </Dialog>
      )
}



function EventsList({events, user, panTo,handleEventsWindow,showMore}){
      useEffect(()=>{
            setEventsData(events)
      },[events] )
      const [eventsData, setEventsData ] = useState();
     
      return(
      <Box> {eventsData <= 0 ? 
            <Box mt="300px">
              <Text textAlign="center" fontWeight='bold'  color="#aaa">No events</Text>
            </Box>
            :
            eventsData && eventsData.sort((a, b) => b.date - a.date).map(post => (
            <Block item key={post.id}>
                  <Box my={3} ml={1}>
                        {post.website ? 
                  <ParserEvent post={post} user={user} panTo={panTo} handleEventsWindow={handleEventsWindow}/>:
                  <Event post={post} user={user} panTo={panTo} handleEventsWindow={handleEventsWindow}/>
                        }
                  </Box>
            </Block>
            ))  
      }
            {eventsData >= 10 ?null: <Flex width={1}>
            <Flex mx="auto">
             <ArrowDownwardIcon onClick={()=> showMore()} color="primary" fontSize="large"/>
       </Flex>
       </Flex>}
      </Box>
)
}

function FilterBlock(props){
      const {favoriteHandle, myFollowingHandle, onlineHandle} =props;
      return(
            <Flex ml="auto" >
                  <WrapperFilterEvent maxWidth={[null,"200px","170px"]} width={1}>
               <Box >
                     <TextField 
                        maxWidth
                        placeholder="Find event" 
                        value={props.searchValue}
                        onChange={props.onSearchChange}/>
               <Accordion>
                  <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  >
                  <Text textAlign="left">Types</Text>
                  </AccordionSummary>
                  <AccordionDetails>
                  <Flex flexDirection="column" mr="auto " >
                  <RadioGroup value={props.typeValue} onChange={props.onTypeChange}>
                     <FormControlLabel value="Party" control={
                           <Radio 
                           color="primary"/>}
                           label="Party"/>
                     <FormControlLabel value="Club" control={
                           <Radio 
                           color="primary"/>}
                           label="Club"/>
                     <FormControlLabel value="Meeting" control={
                           <Radio 
                           color="primary"/>}
                           label="Meeting"/>
                      <FormControlLabel value="Exhibition" control={
                            <Radio 
                            color="primary"/>}
                            label="Exhibition"/>
                    </RadioGroup>
                   </Flex>
                  </AccordionDetails>
                  </Accordion>
                  </Box>
                  <Flex mt={3} flexDirection="column">
                    <FormControlLabel control={
                        <Checkbox 
                        onChange={()=>favoriteHandle()} 
                        color="primary"/>}
                        label="Favorite"/>
                    <FormControlLabel control={
                        <Checkbox 
                        onChange={()=>myFollowingHandle()}
                        color="primary"/>}
                        label="My friends"/>
                     <FormControlLabel control={
                        <Checkbox 
                        onChange={()=>onlineHandle()}
                        color="primary"/>}
                        label="Online events"/>     
                  </Flex>
            </WrapperFilterEvent>
            </Flex>
      )
}
