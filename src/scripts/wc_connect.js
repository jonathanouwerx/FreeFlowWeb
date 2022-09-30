import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

walletConnectInit = async () => {
  // bridge url
  const bridge = "https://bridge.walletconnect.org";

  // create new connector
  const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

  await this.setState({ connector });

  // check if already connected
  if (!connector.connected) {
    // create new session
    await connector.createSession();
  }

  // subscribe to events
  this.subscribeToEvents();
};

subscribeToEvents = () => {
    const { connector } = this.state;
  
    if (!connector) {
      return;
    }
  
    // When the DApp is connected to the wallet, if the wallet info changes (chainId or address in most cases), the session_update callback will be triggered
    connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`, payload);
  
      if (error) {
        throw error;
      }
  
      const { chainId, accounts } = payload.params[0];
  
      // Obtain accounts and chainId through payload.params and update the state of the DApp
      this.onSessionUpdate(accounts, chainId);
    });
  
    connector.on("connect", (error, payload) => {
      console.log(`connector.on("connect")`, payload);
  
      if (error) {
        throw error;
      }
  
      this.onConnect(payload);
    });
  
    connector.on("disconnect", (error, payload) => {
      console.log(`connector.on("disconnect")`, payload);
  
      if (error) {
        throw error;
      }
  
      this.onDisconnect();
    });
  
    // If the connection already exists, the QR code popup will not be triggered after walletConnectInit is executed, and you’ll only have to update the state of the DApp
    if (connector.connected) {
      const { chainId, accounts } = connector;
      const address = accounts[0];
      this.setState({
        connected: true,
        chainId,
        accounts,
        address,
      });
      this.onSessionUpdate(accounts, chainId);
    }
  
    this.setState({ connector });
  };