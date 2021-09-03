pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

      struct insurance {
          uint256 insruanceValue;
          uint256 credit;
      }

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false
    mapping(address => uint256) private authorizedContracts;
    address[] registeredAirLines = new address[](0);
    //
    mapping(address =>insurance) private flightInsurance;

    mapping(bytes32 =>bool) private registeredFligths;

    mapping(bytes32 =>address[])private  flightsToaddress;

    mapping(address =>bool) public isAirlineFund;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor(address airline) public {
        contractOwner = msg.sender;
        registeredAirLines.push(airline);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
    /**
     * @dev Modifier that requires the "authorized App contracts " account to be the function caller
     */
    modifier requireIsCallerAuthorized() {
        require(
            authorizedContracts[msg.sender] == 1,
            "contract is not authorized to access functions !!"
        );
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function authorizeContract(address contractAddress)
        external
        requireContractOwner
    {
        authorizedContracts[contractAddress] = 1;
    }

    function deauthorizeContract(address contractAddress)
        external
        requireContractOwner
    {
        delete authorizedContracts[contractAddress];
    }

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(address airline)
        external
        requireIsCallerAuthorized
    {
        registeredAirLines.push(airline);
    }

    function getRegisteredAirlinesCount()
        external
        view
        requireIsCallerAuthorized
        returns (uint)
    {
        return registeredAirLines.length;
    }

    function getRegisteredAirlinElement(uint256 index)
        external
        view
        requireIsCallerAuthorized
        returns (address)
    {
        return registeredAirLines[index];
    }

    function registerFlight(bytes32 key) 
        external
        requireIsCallerAuthorized
    {
        require(isAirlineFund[tx.origin],"airline didn't fund the contract");
        registeredFligths[key]=true;
    }

    function isFlightRegisted(bytes32 key) 
        external
        view
        requireIsCallerAuthorized
        returns(bool)
    {
        return registeredFligths[key];
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy(
        bytes32 key
    ) 
    external payable 
    requireIsCallerAuthorized
    {
        //funds shall be transfer from calling contract balance to current contract balance
        //given that the tx.orgin already transfered values to calller contract address
        flightInsurance[tx.origin]=insurance({
            insruanceValue: msg.value,
            credit:0
        });
        flightsToaddress[key].push(tx.origin);
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees( bytes32 key) external  
    requireIsCallerAuthorized
    {
        for (uint i=0;i<flightsToaddress[key].length;i++)
        {
            address addr=flightsToaddress[key][i];
            flightInsurance[addr].credit=(flightInsurance[addr].insruanceValue*3)/2;
            flightInsurance[addr].insruanceValue=0;
        }
        //since fligth is over delete all insurances assigned to the flight
        delete(flightsToaddress[key]);
        delete(registeredFligths[key]);
    }

    function removeFlight( bytes32 key) external  
    requireIsCallerAuthorized
    {
         delete(flightsToaddress[key]);
         delete(registeredFligths[key]);
    }

    function isInsuredBufore( bytes32 key) 
    external 
    view 
    requireIsCallerAuthorized
    returns(bool)
    {
        for (uint i=0;i<flightsToaddress[key].length;i++)
        {
            if(flightsToaddress[key][i]==tx.origin)
            {
                return true;
            }
        }
        return false;
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay(uint256 amount) external payable 
    {
        require(flightInsurance[tx.origin].credit >= amount,"user doesn't have enough funds");
        require(address(this).balance > amount,"contract balance not enough");
        flightInsurance[tx.origin].credit.sub(amount);
        tx.origin.transfer(amount);
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable 
    requireIsCallerAuthorized
    {
        isAirlineFund[tx.origin]=true;
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    function() external payable {
      //////  fund(); this function causes transfer to abort as not enough gas !!!
    }
}
