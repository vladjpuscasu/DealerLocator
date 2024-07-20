<?php
namespace VPuscasu\DealerLocator\Controller\Ajax;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\App\Request\Http;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Data\Form\FormKey;
use Magento\Framework\UrlInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\App\Config\ScopeConfigInterface;

use Psr\Log\LoggerInterface;

//use VPuscasu\DealerLocator\Helper\Data as DealerLocatorHelper;

class Index extends Action
{
    protected $_request;
    protected $_resultJsonFactory;
    protected $formKey;
    protected $_ajaxUrl;
    protected $urlBuilder;
    protected $_curl;
    protected $_logger;
    protected $scopeConfig;

    public function __construct(
        Context $context,
        Http $request,
        JsonFactory $resultJsonFactory,
        Curl $curl,
        FormKey $formKey,
        UrlInterface $urlBuilder,
        LoggerInterface $logger,
        ScopeConfigInterface $scopeConfig,
        //$ajaxUrl,
        array $data = []
    ) {
        $this->_request = $request;
        $this->_resultJsonFactory = $resultJsonFactory;
        $this->_curl = $curl;
        $this->formKey = $formKey;
        $this->urlBuilder = $urlBuilder; 
        $this->_logger = $logger;
        $this->_ajaxUrl = $this->urlBuilder->getUrl('/heloo/ajax/');
        $this->scopeConfig = $scopeConfig;
        parent::__construct($context, $data);
    }
    public function getAjaxUrl()
    {
        //return $this->urlBuilder->getUrl('app/code/VPuscasu/dealerlocator/block/dealerlocator/execute', ['_secure' => true]);
        return $this->_ajaxUrl;
    }

    public function isAjax()
    {
        // Check if it's an AJAX request (XHR)
        return $this->_request->isXmlHttpRequest();
    }

    public function getFormKey()
    {
        return $this->formKey->getFormKey();
    }

    public function execute()
    {
    $action = $this->getRequest()->getParam('action');
    $resultData = [];

    switch ($action) {
        case 'dealer_locator_search':
            $resultData = $this->handleDealerLocatorSearch();
            break;

        case 'distributors_request':
            $resultData = $this->handleDistributorsRequest();
            break;

        default:
            $resultData = ['error' => 'Invalid action'];
            break;
    }

    $jsonData = json_encode($resultData);

    // Set the JSON response headers and content
    $this->getResponse()->setHeader('Content-Type', 'application/json', true);
    $this->getResponse()->setContent($jsonData);

    return $this->getResponse();
    }


    public function handleDealerLocatorSearch()
    {
        

        //$formKey = $this->_request->getPost('form_key');

        /*if (!$this->formKey->validate($formKey)) {
            $response->setData('error', 'Invalid form key.');
            $resultJson = $this->resultJsonFactory->create();
            $resultJson->setData($response->getData());
            return $resultJson;
        }*/
    // Fetch the Site API Key from configuration
    $siteApiKey = $this->scopeConfig->getValue(
        'VPuscasu_dealerlocator/api/site_api_key',
        \Magento\Store\Model\ScopeInterface::SCOPE_STORE
    );
    $response = new \Magento\Framework\DataObject();
    $search = $this->_request->getParam('search'); 
        
    $search = !empty($search) ? rawurlencode($search) : null;

    $url = 'https://ddp.VPuscasu.com/geo?key=' . $siteApiKey . '&address=' . $search;

    $this->_curl->get($url);
    $responseBody = $this->_curl->getBody();
    $statusCode = $this->_curl->getStatus();

    if ($statusCode === 200) {
        try {
            $data = json_decode($responseBody);
            if (isset($data->statusCode)) {
                $response->setData('data', $data);
                switch ($data->statusCode) {
                    case '100':
                        // Dealers found.
                        break;

                    case '101':
                        // Search is too broad. Please narrow your search and try again.
                        break;

                    case '102':
                        // There are no nearby dealers.
                        break;

                    case '103':
                        // There are no dealers in that country.
                        break;

                    case '104':
                        // There are no dealers, no distributors in that country.
                        break;

                    default:
                        break;
                }
            } else {
                $response->setData('error', 'Incompatible response received from server.');
            }
        } catch (\Exception $e) {
            $response->setData('error', 'Invalid response received from server.');
        }
    } else {
        $response->setData('message', 'Could not retrieve search results from server.');
    }
    // Convert the data to JSON
    return $response->getData();

   

    }

    public function handleDistributorsRequest()
    {
    // Fetch the Site API Key from configuration
    $siteApiKey = $this->scopeConfig->getValue(
        'VPuscasu_dealerlocator/api/site_api_key',
        \Magento\Store\Model\ScopeInterface::SCOPE_STORE
    );

    $response = new \Magento\Framework\DataObject();
    $url = 'https://ddp.VPuscasu.com/alldis?key=' . $siteApiKey;

    $this->_curl->get($url);
    $responseBody = $this->_curl->getBody();
    $statusCode = $this->_curl->getStatus();

    if ($statusCode === 200) {
        try {
            $data = json_decode($responseBody);
            if (isset($data->statusCode)) {
                $response->setData('data', $data);
                switch ($data->statusCode) {
                    case '109':
                        // Distributors loaded.
                        break;

                    case '911':
                        $response->setData('error', 'Nadaaaa.');
                        // DDM error response.
                        break;

                    default:
                        break;
                }
            } else {
                $response->setData('error', 'Incompatible response received from server.');
            }
        } catch (\Exception $e) {
            $response->setData('error', 'Invalid response received from server.');
        }
    } else {
        $response->setData('message', 'Could not retrieve search results from server.');
    }

    return $response->getData();
}
}