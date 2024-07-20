<?php
namespace VPuscasu\DealerLocator\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Framework\App\Request\Http;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Data\Form\FormKey;
use Magento\Framework\UrlInterface;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem; 
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\EscaperFactory;

class DealerLocator extends Template
{
    protected $_request;
    protected $resultJsonFactory;
    protected $formKey;
    protected $_ajaxUrl;
    protected $urlBuilder;
    protected $_filesystem;
    protected $_fileConfig;
    protected $scopeConfig;
    protected $_escaperFactory;

    public function __construct(
        Context $context,
        Http $request,
        JsonFactory $resultJsonFactory,
        Curl $curl,
        FormKey $formKey,
        UrlInterface $urlBuilder,
        DirectoryList $directoryList,
        Filesystem $filesystem,
        ScopeConfigInterface $scopeConfig,
        EscaperFactory $escaperFactory,
        array $data = []
    ) {
        $this->_request = $request;
        $this->resultJsonFactory = $resultJsonFactory;
        $this->_curl = $curl;
        $this->scopeConfig = $scopeConfig;
        $this->formKey = $formKey;
        $this->urlBuilder = $urlBuilder; 
        $this->directoryList = $directoryList;
        $this->_filesystem = $filesystem;
        $this->_escaperFactory = $escaperFactory;
        $this->_fileConfig = $this->_filesystem->getDirectoryRead(DirectoryList::CONFIG); // Update this line
        $this->_ajaxUrl = $this->urlBuilder->getUrl('VPuscasu_DealerLocator/DealerLocator/Ajax', ['_secure' => true]);
        parent::__construct($context, $data);
    }
    public function getGoogleMapsApiKey()
    {
        return $this->scopeConfig->getValue(
            'VPuscasu_dealerlocator/api/google_maps_api_key',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        
    }

    public function getSiteApiKey()
    {
        return $this->scopeConfig->getValue(
            'VPuscasu_DealerLocator/Api/site_api_key',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
    }
    public function getAjaxUrl()
    {
        //return $this->urlBuilder->getUrl('app/code/VPuscasu/dealerlocator/block/dealerlocator/execute', ['_secure' => true]);
        return $this->_ajaxUrl;
    }
    public function getFormKey()
    {
        return $this->formKey->getFormKey();
    }
    public function getGmaps()
{
    $google_maps_api_key = $this->getGoogleMapsApiKey();
    $gmaps = 'https://maps.googleapis.com/maps/api/js?key=' . $google_maps_api_key . '&callback=dealer_locator_init_map';
    
    // Get the Escaper instance from the context
    $escaper = $this->_escaperFactory->create();

    // Use the escapeHtml method to prevent HTML escaping
    return $escaper->escapeHtml($gmaps);
}
    public function getApiKey()
    {
    $site_api_key = $this->getSiteApiKey();
   
    return $site_api_key;
    }

    public function isAjax()
    {
        // Check if it's an AJAX request (XHR)
        return $this->_request->isXmlHttpRequest();
    }

    // Function to pass data to dealer_locator.phtml template
    /*
    protected function execute()
    {
        // Enqueue style and script - Add appropriate paths for the CSS and JavaScript files.
        $css_path = 'path/to/dealer-locator.css';
        $js_path = 'app\code\VPuscasu\DealerLocator\web\js\dealer_locator.js';
        // Get the AJAX controller URL
        $ajaxUrl = $this->getUrl('dealerlocator/controller/index');
       

      
        // Fetch the Google Maps API key from the configuration file
        $google_maps_api_key = $this->getGoogleMapsApiKey();
        $gmaps = 'https://maps.googleapis.com/maps/api/js?key=' . $google_maps_api_key . '&callback=dealer_locator_init_map';
        //$this->pageConfig->addRemotePageAsset($gmaps);

        // Set a "waiting for results" gif - Add appropriate path for the loading spinner GIF.
        $loading = 'https://upload.wikimedia.org/wikipedia/commons/0/06/Rotating_line_sections.gif?20170916205934';

        // Prepare the data to be passed to the PHTML template
        $data = [
            'css_path' => $css_path,
            'js_path' => $js_path,
            'gmaps' => $gmaps,
            'loading' => $loading
        ];
    
        // Render the PHTML template with the data
        return $this->getLayout()->createBlock(
            \Magento\Framework\View\Element\Template::class,
            '',
            ['data' => $data]
        )->setTemplate('VPuscasu_DealerLocator::dealer_locator.phtml')->toHtml();
    }*/

    
}