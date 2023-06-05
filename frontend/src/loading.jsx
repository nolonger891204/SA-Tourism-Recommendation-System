import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const antIcon = (
  <LoadingOutlined
    style={{
      fontSize: 54,
    }}
    spin
  />
);

const Loading = () => 
  <div style={{
    width: "80%",
    height: "85%",
    display: "flex", 
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 1,
  }}>
    <Spin indicator={antIcon} />
  </div>;
export { Loading };