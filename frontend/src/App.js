import { Form, Button, Layout, Col, Row, List } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState, useRef } from "react";
import styled from "styled-components";
import { Loading } from "./loading";
import { MapContainer } from "./containers/MapContainer";
import MapContext from './hook/MapContext';
import { fromLonLat } from "ol/proj";

const { Header, Footer, Content } = Layout;
const Card = styled.div`
  height: 150px;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  &.active{
    border: 3px solid #e9bf3b;
  }
`;

function App() {
  const [ step, setStep ] = useState(0);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ firstResult, setFirstResult ] = useState([]);
  const [ secondQueryNum, setSecondQueryNum] = useState({'id': 0, 'name': null});
  const [ secondResult, setSecondResult] = useState([]);
  /* MAP */
  const mapRef = useRef();
	const [ map, setMap ] = useState(null);
  const [ mapView, setMapView ] = useState(false);
  const [ center, setCenter ] = useState(fromLonLat([120.60707177915855, 22.96194716526975]));
  const [ zoom, setZoom ] = useState(8);
  const [ extent, setExtent ] = useState();
  const [ feature, setFeature ] = useState({
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
      { "type": "Feature", "properties": { }, "geometry": { "type": "Point", "coordinates": [ 121.537904291611767, 25.025701384583357 ] } }
    ]
  });

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const firstQuery = async (values) => {
    const query = values.queryString;
    const body = {
      query: query
    };
    setIsLoading(true);
    await fetch('http://127.0.0.1:5000/firstQuery', {
      mode: 'cors',
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    })
    .then(response => response.text())
    .then(result => {
      setStep(1);
      setIsLoading(false);
      setFirstResult(JSON.parse(result));
    })
    .catch(error => console.log(error));
  };

  const secondQuery = async () => {
    const body = secondQueryNum;
    setIsLoading(true);
    await fetch('http://127.0.0.1:5000/secondQuery', {
      mode: 'cors',
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    })
    .then(response => response.text())
    .then(result => {
      setStep(2);
      setIsLoading(false);
      setSecondResult(JSON.parse(result));
    })
    .catch(error => console.log(error));
  };

  return (
    <div className="App" 
      style={{ 
        border: "7px solid #2f387d",
        paddingInline: "5%",
        height: "calc( 100vh - 14px )",
        background: "#f5f5f5",
      }}
    >
      <Layout>
        <Header 
          style={{ 
            background: "none",
            color: "#2f387d",
            lineHeight: "30px",
            height: "15vh",
          }}
        >
          <h2>結合地理資訊之互動式個性化旅遊推薦系統展示平台</h2>
        </Header>
        <Content
          style={{
            background: "#ffffff",
            borderRadius: "10px",
            padding: "5% 10%",
            height: "72vh",
            overflowY: "scroll",
          }}
        >
          {(isLoading) && 
            <Loading />
          }
          {(step === 0) && 
              <Form
                name="queryRoundOne"
                onFinish={firstQuery}
              > 
                <h3>請輸入問句...</h3>
                <Form.Item
                  name="queryString"
                >
                  <TextArea />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Submit</Button>
                </Form.Item>
              </Form>
            }
            {(step === 1) &&
              <Form
                name="queryRoundTwo"
              >
                <h3>您更想去哪個地方呢？我可以為您推薦相關鄰近的其他地點</h3>
                <Form.Item
                  name="querySpot"
                >
                  <Row 
                    gutter={[24, 16]}
                    style={{alignItems:"center"}}
                  >
                    {
                      firstResult.map(({ name }, index) => {
                        return (
                          <Col xs={24} md={8}>
                            <Card 
                              className={(secondQueryNum.id === index) ? "active": ""}
                              onClick={()=>setSecondQueryNum({'id': index, 'name': name})}
                            >
                              {name}
                            </Card>
                          </Col>
                        )
                      })
                    }
                  </Row>
                </Form.Item>
              <Form.Item>
                <Button onClick={secondQuery}>Submit</Button>
              </Form.Item>
            </Form>
            }
            {(step === 2) &&
              <Row 
                gutter={[24, 16]}
                style={{alignItems:"center"}}
              >
                <Col xs={24} md={12}>
                  <h3>與<span style={{color:"#2f387d"}}>{secondQueryNum.name}</span>性質相近，且離<span style={{color:"#2f387d"}}>{secondQueryNum.name}</span>近的地點有</h3>
                  <List>
                  {
                    secondResult.map(({ name }, index) => {
                      return (
                        <List.Item>
                          {name}
                        </List.Item>
                      )
                    })
                  }
                  </List>
                </Col>
                <Col xs={24} md={12}>
                  <MapContext.Provider value={{ map, mapRef, zoom, center, setCenter, setMap, setZoom, secondResult, setFeature, extent, setExtent }}>
                    <MapContainer mapView={mapView} setMapView={setMapView} />
                  </MapContext.Provider>
                </Col>
              </Row>
            }
        </Content>
        <Footer
          style={{
            textAlign: "center",
            color: "#555555",
            fontSize: "xx-small",
          }}
        >
          社群媒體分析 2023 Spring | 林宜璇 胡予瑄 劉彥晴 顏廷龍 邱世弦
        </Footer>
      </Layout>
    </div>
  );
}

export default App;
