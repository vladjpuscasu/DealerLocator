<?php

namespace VPuscasu\DealerLocator\Block\Adminhtml\Form\Field;

use Magento\Config\Block\System\Config\Form\Field;
use Magento\Framework\Data\Form\Element\AbstractElement;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

class GoogleMapsApiKey extends Field
{
    /**
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * Constructor
     *
     * @param \Magento\Backend\Block\Template\Context $context
     * @param ScopeConfigInterface $scopeConfig
     * @param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        ScopeConfigInterface $scopeConfig,
        array $data = []
    ) {
        $this->scopeConfig = $scopeConfig;
        parent::__construct($context, $data);
    }

    /**
     * Render site API key field as a hidden input
     *
     * @param  AbstractElement $element
     * @return string
     */
    public function render(AbstractElement $element)
    {
        // Determine the scope and scope ID
        $scope = ScopeInterface::SCOPE_STORE; // or ScopeInterface::SCOPE_WEBSITE, or ScopeConfigInterface::SCOPE_TYPE_DEFAULT
        $scopeId = $this->_request->getParam('store', 0); // 0 for default, or use specific store/website ID
        
        // Retrieve the API key from configuration
        $apiKey = $this->scopeConfig->getValue('VPuscasu_dealerlocator/api/google_maps_api_key', $scope, $scopeId);

        $element->setType('hidden');
        $element->setValue('GOOGLE_API_KEY_HERE'); 
        return parent::render($element);
    }
}